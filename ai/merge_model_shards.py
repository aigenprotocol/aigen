import glob
import json
import numpy as np
import os
import pandas as pd

from ai.config import MODELS_DIR


def aggregate_shards(model_name):
    print("\nAggregating shards...")
    aggregated_shards_dir = os.path.join(os.path.join(MODELS_DIR, model_name), "aggregated_shards")
    downloaded_shards_dir = os.path.join(os.path.join(MODELS_DIR, model_name), "downloaded_shards")
    os.makedirs(aggregated_shards_dir, exist_ok=True)

    filepaths = glob.glob(os.path.join(downloaded_shards_dir, "{}_shard_*".format(model_name)))

    for index, filepath in enumerate(filepaths):
        print("File processed {} out of {}".format(index + 1, len(filepaths)))
        print("Filepath:", filepath)
        with open(filepath, "r") as f:
            layer_weights = json.load(f)

            for layer_dict in layer_weights:
                layer_name = layer_dict['layer_name']

                aggregated_shards_file = os.path.join(aggregated_shards_dir, "{}.json".format(layer_name))

                if os.path.exists(aggregated_shards_file):
                    with open(aggregated_shards_file, "r") as fp:
                        existing_weights = json.load(fp)['weights']
                        existing_weights.extend(layer_dict['weights'])
                else:
                    existing_weights = layer_dict['weights']

                with open(os.path.join(aggregated_shards_file), "w") as fq:
                    json.dump({"layer_name": layer_dict['layer_name'], "weights": existing_weights}, fq)


def concatenate_arrays(model_name):
    print("\nConcatenating arrays...")
    aggregated_shards_dir = os.path.join(os.path.join(MODELS_DIR, model_name), "aggregated_shards")
    final_weights_dir = os.path.join(os.path.join(MODELS_DIR, model_name), "final_weights")
    os.makedirs(final_weights_dir, exist_ok=True)

    filepaths = glob.glob(os.path.join(aggregated_shards_dir, "*"))

    for index, filepath in enumerate(filepaths):
        print("File processed {} out of {}".format(index + 1, len(filepaths)))
        print("Filepath:", filepath)
        with open(filepath, "r") as f:
            layer_dict = json.load(f)

            layer_name = layer_dict['layer_name']
            weights = layer_dict['weights']

            if len(weights) == 0:
                with open(os.path.join(final_weights_dir, "{}.json".format(layer_name)), "w") as fp:
                    json.dump(layer_dict, fp)
            else:
                df = pd.DataFrame(weights)
                weight_nos = list(set(df['weight_no'].tolist()))
                all_stacked_weights = []

                for weight_no in weight_nos:
                    weights1 = df.loc[df['weight_no'] == weight_no]
                    weights1 = weights1.sort_values(by=['shard_no'], ascending=True)
                    values = weights1['values'].to_list()
                    if len(values) == 1:
                        stacked_weights = values[0]
                    else:
                        stacked_weights = np.concatenate(values, axis=-1).tolist()

                    all_stacked_weights.append({"weight_no": weight_no, "shard_no": 1,
                                                "values": stacked_weights})

                layer_dict['weights'] = all_stacked_weights

                with open(os.path.join(final_weights_dir, "{}.json".format(layer_name)), "w") as fp:
                    json.dump(layer_dict, fp)


def merge_shards(model_name):
    aggregate_shards(model_name)
    concatenate_arrays(model_name)
