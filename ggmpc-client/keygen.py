import ecdsa, unittest
import thresecdsa,pickle,json,jsonpickle
import thresecdsa.curves as curves

def test_2_in_2_of_3():
	print("== Generating Client and Server Keys ==")
	mpc = thresecdsa.Ecdsa(curves.secp256k1)
	A = mpc.key_share(1,2,2)
	B = mpc.key_share(2,2,2)
	A, B =\
		mpc.key_combine((A[1],B[1])),\
		mpc.key_combine((A[2],B[2])),
	A = mpc.sign_challenge((A[1], A[2]))
	BA = mpc.sign_share((A[2], B[2]))
	AB = mpc.sign_convert((A[1], BA[1]))
	BA = mpc.sign_convert((BA[2], AB[2]))
	AB = mpc.sign_convert((AB[1], BA[1]))
	AB, BA = \
		mpc.sign_combine((AB,)), \
		mpc.sign_combine((BA,)),

	server_secret = [AB[1],BA[1]]
	client_secret = [AB[2],BA[2]]
	print(type(server_secret))
	with open('keygen-server', 'wb') as config_dictionary_file:
		pickle.dump(server_secret, config_dictionary_file)
	with open('keygen-client', 'wb') as config_dictionary_file:
		pickle.dump(client_secret, config_dictionary_file)
	with open('keygen-client.json', 'w+') as fp:
		json.dump(jsonpickle.encode(client_secret), fp)

if __name__ == '__main__':
	test_2_in_2_of_3()
