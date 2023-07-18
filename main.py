from dotenv import load_dotenv

load_dotenv()

import shutil
import argparse
import os

from ai.config import MODELS_DIR
from ai.utils import slugify
from ai import create_shards, save_model, merge_shards, load_model_weights

if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='AigenML', description="Aigen's machine learning library to extract models "
                                                                 "weights, create shards, merge shards, and load model "
                                                                 "based on number of ainfts specified",
                                     epilog="Get more help at contact@aigenprotocol.com")
    parser.add_argument('-a', '--action', help='specify action')
    parser.add_argument('-n', '--name', help='specify project name')
    parser.add_argument('-m', '--model_path', help='specify model path')
    parser.add_argument('-no', '--no_of_ainfts', type=int, help='specify number of ainfts to create')
    args = parser.parse_args()

    model_name = slugify(args.name)
    # create model directory
    os.makedirs(os.path.join(MODELS_DIR, model_name), exist_ok=True)

    if args.action == "create_shards":
        # remove directory
        if os.path.exists(os.path.join(MODELS_DIR, model_name)):
            shutil.rmtree(os.path.join(MODELS_DIR, model_name))

        # extracts and save model weights
        save_model(model_name=model_name, model_dir=MODELS_DIR, model_path=args.model_path)
        print("Model weights extracted successfully!")

        # create shards
        create_shards(model_name=model_name, model_dir=MODELS_DIR, no_of_ainfts=args.no_of_ainfts)
        print("Model shards created successfully!")

        print("Model name:", model_name)
        print("Model directory:", os.path.join(MODELS_DIR, model_name))
    if args.action == "merge_shards":
        merge_shards(args.name)
        print("Shards merged successfully!")
    elif args.action == "load_model":
        model = load_model_weights(model_name=args.name)
        print("Loaded model:", model)
