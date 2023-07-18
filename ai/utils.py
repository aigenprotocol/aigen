import glob
import numpy as np
import os
import re
import unicodedata


def get_model_size(model_dir):
    files = glob.glob(os.path.join(model_dir, "weights/*"))
    total_size = 0
    for file in files:
        total_size += os.path.getsize(file)

    return total_size


def slugify(value, allow_unicode=False):
    """
    Taken from https://github.com/django/django/blob/master/django/utils/text.py
    Convert to ASCII if 'allow_unicode' is False. Convert spaces or repeated
    dashes to single dashes. Remove characters that aren't alphanumerics,
    underscores, or hyphens. Convert to lowercase. Also strip leading and
    trailing whitespace, dashes, and underscores.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')


def compare_model_weights_keras(model, model1):
    """
    Compare model weights for keras models
    """
    for layer in model.layers:
        print("Layer:", layer.name)
        for index, weight in enumerate(layer.weights):
            weight1 = model1.get_layer(layer.name).get_weights()[index]
            if np.array_equal(weight, weight1):
                pass
            else:
                print("Not equal")
                return False

    return True
