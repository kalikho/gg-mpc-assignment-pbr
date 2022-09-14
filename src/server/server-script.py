#!/usr/bin/python
import pickle
import pickle,sys,json
import ecdsa, unittest
import thresecdsa,pickle
import thresecdsa.curves as curves
import jsonpickle,os
from os.path import exists
import copy
from dotenv import load_dotenv

load_dotenv()
PATH = os.getenv('DIRPATH')
#Load serverKey generated at the client's end
serverKey = pickle.load(open(PATH+"uploads/keygen-server","rb"))
#Initiate EC
mpc = thresecdsa.Ecdsa(curves.secp256k1)
#Receive message to sign
message = str.encode(sys.argv[1])
query = str(sys.argv[2])
client_signature_r = int(sys.argv[3])
client_signature_s = int(sys.argv[4])

#Server signs the message
serverSignature = mpc.sign(message, (serverKey[0], serverKey[1]))
clientSignature = copy.deepcopy(serverSignature)
clientSignature['r'] = client_signature_r
clientSignature['s'] = client_signature_s
print("Client Signature",clientSignature)
print("Server Signature",serverSignature)
#Combine client and server signature
sig = mpc.sign_combine((clientSignature,serverSignature))
#verify signature
try:
    output = mpc.verify(message, sig)
except:
    output = False
file_exists = exists(PATH+"/"+"outputs/success")
if(file_exists):
    os.remove(PATH+"/"+"outputs/success")
file_exists = exists(PATH+"/"+"outputs/error")
if(file_exists):
    os.remove(PATH+"/"+"outputs/error") 

if(output):
    with open(PATH+"/"+"outputs/success", 'w') as fp:
        pass
else:
    with open(PATH+"/"+"outputs/error", 'w') as fp:
        pass

#Write to json file
dictionary = [{"r":sig["r"], "s":sig["s"]},{"r":serverSignature["r"],"s":serverSignature["s"]}]
json_object = json.dumps(dictionary, indent=4)
 
# Writing to sample.json
with open(PATH+"/"+"outputs/signatures.json", "w+") as outfile:
    outfile.write(json_object)
with open(PATH+"/"+"outputs/"+str(query), "w+") as outfile:
    pass