import torch 
import os 
import json 

def clean_dict_helper(d):
    if isinstance(d, np.ndarray):
        return d.tolist()

    if isinstance(d, list):  # For those db functions which return list
        return [clean_dict_helper(x) for x in d]

    if isinstance(d, dict):
        for k, v in d.items():
            d.update({k: clean_dict_helper(v)})

    # return anything else, like a string or number
    return d

def save_model_architecture(model_name, model_dir, model):
    print("Saving model architecture")
    os.makedirs(f"{model_dir}/{model_name}", exist_ok=True)

    # Save the model architecture
    architecture = {
        "model_name": model_name,
        "state_dict": model.state_dict(),
        "model_params": model.__repr__(),
    }

    with open(f"{model_dir}/{model_name}/{model_name}_architecture.pth", "wb") as f:
        torch.save(architecture, f)

def save_model_weights(model_name, model_dir, model):
    print("Saving model weights")

    # Create directories if they don't exist
    os.makedirs(f"{model_dir}/{model_name}/weights", exist_ok=True)

    layer_index = 1

    for name, parameter in model.named_parameters():
        if 'weight' in name:
            layer_name = name.split('.')[0]
            weight_format = {"layer_name": layer_name}
            all_weights = []

            # Extract the weights as a list
            weights = parameter.data.tolist()

            for index, weights_per_shard in enumerate(weights):
                all_weights.append({"weight_no": index + 1, "shard_no": 1, "values": weights_per_shard})

            weight_format['weights'] = all_weights

            with open(f"{model_dir}/{model_name}/weights/layer{layer_index}.json", "w") as f:
                json.dump([weight_format], f)

            layer_index += 1


