from dotenv import load_dotenv

load_dotenv()

import argparse

from ai import merge_shards

if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='AigenML', description="Merge model shards to get "
                                                                 "back the original weight files",
                                     epilog="Get more help at contact@aigenprotocol.com")
    parser.add_argument('-n', '--name', help='project name')
    args = parser.parse_args()

    merge_shards(args.name)
    print("Shards merged successfully!")
