#!/usr/bin/python
import pickle,sys,json
import ecdsa, unittest
import ggmpc,pickle
import ggmpc.curves as curves
import jsonpickle

def client():
    mpc = ggmpc.Ecdsa(curves.secp256k1)
    with open('keygen-client', 'rb') as config_dictionary_file:
        config_dictionary = pickle.load(config_dictionary_file)
    message = str.encode(sys.argv[1])
    signed_message = mpc.sign(message, (config_dictionary[0], config_dictionary[1]))
    with open('client-signed-message.json', 'w+') as fp:
        json.dump(jsonpickle.encode(signed_message), fp)
    with open('client-signed-message', 'wb') as config_dictionary_file:
        pickle.dump(signed_message, config_dictionary_file)
client()