import glob
import json
import math
import os

import numpy as np

from ai.utils import get_model_size


def get_small_large_files(weights_path, minimum_split_size, maximum_split_size):
    """
    Split files into three categories
    :param weights_path: Directory path
    :param minimum_split_size: minimum split size
    :param maximum_split_size: maximum split size
    :return:
    """
    small_files = []
    large_files = []
    normal_files = []

    for filename in os.listdir(weights_path):
        filepath = os.path.join(weights_path, filename)
        filesize = os.path.getsize(filepath)
        if filesize > maximum_split_size:
            large_files.append(filepath)
        elif filesize < minimum_split_size:
            small_files.append(filepath)
        else:
            normal_files.append(filepath)

    return {"small": small_files, "normal": normal_files, "large": large_files}


def split_large_files(model_name, model_dir, minimum_split_size, maximum_split_size):
    weights_path = os.path.join(model_dir, model_name, "weights")
    shards_dir = os.path.join(model_dir, model_name, "shards")
    os.makedirs(shards_dir, exist_ok=True)
    all_files = get_small_large_files(weights_path, minimum_split_size, maximum_split_size)

    split_index = 1
    print("")
    print("Sharding large files...")
    # split large files
    for i, large_file in enumerate(all_files['large']):
        print("Processed:{}, total:{}".format(i + 1, len(all_files['large'])))
        filesize = os.path.getsize(large_file)
        with open(large_file, "r") as f:
            # print("Large file:", large_file)
            layer_weights = json.load(f)

            for layer_dict in layer_weights:
                weights = layer_dict['weights']
                for weight_dict in weights:
                    weight_no = weight_dict['weight_no']
                    shard_no = weight_dict['shard_no']
                    values = weight_dict['values']

                    weight_arr = np.array(values)
                    weight_arr_size = weight_arr.nbytes

                    if weight_arr_size > maximum_split_size:
                        # Split it
                        split_arrays = np.array_split(weight_arr, int(filesize / maximum_split_size) + 1, -1)

                        for index, split_array in enumerate(split_arrays):
                            split_array_list = split_array.tolist()

                            final_shard = [{"layer_name": layer_dict['layer_name'], "weights": [{"weight_no": weight_no,
                                                                                                 "shard_no": index + 1,
                                                                                                 "values": split_array_list}]}]

                            with open("{}/{}_shard_{}.json".format(shards_dir, model_name, split_index), "w") as fp:
                                json.dump(final_shard, fp)
                                split_index += 1
                                shard_no += 1
                    else:
                        final_shard = [{"layer_name": layer_dict['layer_name'], "weights": [{"weight_no": weight_no,
                                                                                             "shard_no": shard_no,
                                                                                             "values": values}]}]

                        with open("{}/{}_shard_{}.json".format(shards_dir, model_name, split_index), "w") as fp:
                            json.dump(final_shard, fp)
                            split_index += 1
                            shard_no += 1

    print("")
    print("Processing normal files...")
    # Save normal files as it is
    remaining_files = all_files['normal']
    remaining_files.extend(all_files['small'])

    for i, normal_file in enumerate(remaining_files):
        print("Processed:{}, total:{}".format(i + 1, len(remaining_files)))
        with open(normal_file, "r") as f:
            weights = json.load(f)
            with open("{}/{}_shard_{}.json".format(shards_dir, model_name, split_index), "w") as fp:
                json.dump(weights, fp)
            split_index += 1


def merge_small_files(model_name, model_dir, minimum_split_size, maximum_split_size):
    shards_dir = os.path.join(model_dir, model_name, "shards")
    final_shards_dir = os.path.join(model_dir, model_name, "final_shards")
    os.makedirs(final_shards_dir, exist_ok=True)

    all_files = glob.glob(os.path.join(shards_dir, "*"))

    split_index = 1
    # merge small files
    print("")
    print("Merging small files...")
    merge_files_sizes = {}
    for i, small_file in enumerate(all_files):
        print("Processed:{}, total:{}".format(i + 1, len(all_files)))
        filesize = os.path.getsize(small_file)
        if sum(merge_files_sizes.values()) + filesize > maximum_split_size:
            merge_files_sizes[small_file] = filesize
            final_merge = []
            for file_path, size in merge_files_sizes.items():
                with open(file_path, "r") as f:
                    final_merge.extend(json.load(f))
            with open("{}/{}_shard_{}.json".format(final_shards_dir, model_name, split_index), "w") as f:
                json.dump(final_merge, f)
            split_index += 1
            merge_files_sizes = {}
        else:
            merge_files_sizes[small_file] = filesize

    final_merge = []
    for file_path, size in merge_files_sizes.items():
        with open(file_path, "r") as f:
            final_merge.extend(json.load(f))

    with open("{}/{}_shard_{}.json".format(final_shards_dir, model_name, split_index), "w") as f:
        json.dump(final_merge, f)
    split_index += 1


def create_shards(model_name, model_dir, no_of_ainfts):
    print("Creating shards")
    model_size = get_model_size(os.path.join(model_dir, model_name))
    maximum_split_size = math.ceil(model_size/no_of_ainfts)
    minimum_split_size = math.floor(model_size/no_of_ainfts)

    split_large_files(model_name, model_dir, minimum_split_size, maximum_split_size)
    merge_small_files(model_name, model_dir, minimum_split_size, maximum_split_size)
