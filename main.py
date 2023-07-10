from dotenv import load_dotenv

load_dotenv()

import shutil
import argparse
import os

from ai.config import MODELS_DIR
from ai.utils import slugify
from ai import create_shards, save_model

if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='AigenML', description="Aigen's machine learning library to extract models "
                                                                 "weights and create shards based on number "
                                                                 "of ainfts specified",
                                     epilog="Get more help at contact@aigenprotocol.com")
    parser.add_argument('-n', '--name', help='project name')
    parser.add_argument('-m', '--model_path', help='model path')
    parser.add_argument('-no', '--no_of_ainfts', type=int, help='number of ainfts to create')
    args = parser.parse_args()

    model_name = slugify(args.name)

    # remove/create model directory
    if os.path.exists(os.path.join(MODELS_DIR, model_name)):
        shutil.rmtree(os.path.join(MODELS_DIR, model_name))
    os.makedirs(os.path.join(MODELS_DIR, model_name), exist_ok=True)

    # extracts and save model weights
    save_model(model_name=model_name, model_dir=MODELS_DIR, model_path=args.model_path)
    print("Model weights extracted successfully!")

    # create shards
    create_shards(model_name=model_name, model_dir=MODELS_DIR, no_of_ainfts=args.no_of_ainfts)
    print("Model shards created successfully!")

    print("Model name:", model_name)
    print("Model directory:", os.path.join(MODELS_DIR, model_name))
