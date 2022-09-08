#!/usr/bin/python
import pickle
import pickle,sys,json
import ecdsa, unittest
import ggmpc,pickle
import ggmpc.curves as curves
import jsonpickle,os
from os.path import exists


#Load serverKey generated at the client's end
serverKey = pickle.load(open("/home/samurai/gg-mpc-assignment-pbr/application/src/server/uploads/keygen-server","rb"))
#Load signature of message signed by the client
clientSignature = pickle.load(open("/home/samurai/gg-mpc-assignment-pbr/application/src/server/uploads/client-signed-message","rb"))
#Initiate EC
mpc = ggmpc.Ecdsa(curves.secp256k1)
#Receive message to sign
message = str.encode(sys.argv[1])
query = str(sys.argv[2])
#Server signs the message
serverSignature = mpc.sign(message, (serverKey[0], serverKey[1]))
#Combine client and server signature
sig = mpc.sign_combine((clientSignature, serverSignature))
#verify signature
try:
    output = mpc.verify(message, sig)
except:
    output = False
file_exists = exists("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/success")
if(file_exists):
    os.remove("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/success")
file_exists = exists("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/error")
if(file_exists):
    os.remove("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/error") 

if(output):
    with open('/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/success', 'w') as fp:
        pass
else:
    with open('/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/error', 'w') as fp:
        pass

#Write to json file
dictionary = [{"r":sig["r"], "s":sig["s"]},{"r":serverSignature["r"],"s":serverSignature["s"]}]
json_object = json.dumps(dictionary, indent=4)
 
# Writing to sample.json
with open("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/signatures.json", "w+") as outfile:
    outfile.write(json_object)
with open("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/"+str(query), "w+") as outfile:
    pass