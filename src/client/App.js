import React, { Component } from 'react';
import './app.css';
import axios from 'axios';

export default class App extends Component {
  state = {information_message:"Setting Up", client_encoded_sign:null,client_r:null, client_s:null, version: null, pyodide: null, mpc:null, selectedFile: null,uid:"", message: "",clientKey:"",serverResponse : null, notbadsign : null };

onChangeHandler=event=>{
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
}
//API for uploading crypto-materials
onClickHandler = () => {
  const data = new FormData() 
  data.append('file', this.state.selectedFile)
  axios.post("/api/upload", data).then(res => {
  console.log(res)}).catch(err => {
    // Handle error
    console.log(err);
  });
    try {
      let res = axios({
        method: 'post',
        url: '/api/upload',
        data: data
      });
      let data = res.data;
      this.setState({information_message:"File Uploaded Successfully!"});
      return data;
    } catch (error) {
      return error.response;
    }
}

  handleChange(e) {
    e.preventDefault();
    e.target.classList.add('active');
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  
  handleSubmit(e) {    
    e.preventDefault();
    // Receive the message to be signed
    const message = this.state.message;
    const client_r = this.state.client_r;
    const client_s = this.state.client_s;
    const client_encoded_sign = this.state.client_encoded_sign;
    console.log("Submitted message is: ", message)
    const uid = Math.floor(Math.random() * 10000);;
    var status = "Processing";
    var interval = setInterval(() => { 
        axios.post("/api/sign",null, { params: {message,uid,client_r,client_s}}).then(res => { // then print response status
        console.log(res)
        if(res.data == "processing"){
          status = "Processing";
        }
        else if(res.data != "Bad Signature"){
          this.setState({ serverResponse: res })
          this.setState({ notbadsign: "True"})
          status = "completed";
          clearInterval(interval);
        }else{
          this.setState({ notbadsign: "True"});
          this.setState({ serverResponse: null })
          status = "completed";
          clearInterval(interval);
        }
      })
    },1200)
  }

handleClientKey(e){
    alert();
    e.preventDefault();
    const clientKey = this.state.clientKey;
    this.setState({ [clientKey]: clientKey });
    localStorage.setItem('clientKey', clientKey);
    this.setState({information_message:"Client Key Stored in Browse"});
  }

  async handleClientSign(e){
    alert();
    e.preventDefault();
    this.state.pyodide.globals.set("clientSignEnc", localStorage.getItem('clientKey'));
    console.log("Logging from console",localStorage.getItem('clientKey'));
    // await this.state.pyodide.runPython(`clientSignEnc='[{\"i\": 2, \"j\": 1, \"delta\": 5851199919497531865722081285772603159595799562060555981612787514818410175557, \"Gamma\": {\"py/object\": \"ecdsa.ellipticcurve.PointJacobi\", \"py/state\": {\"_PointJacobi__curve\": {\"py/object\": \"ecdsa.ellipticcurve.CurveFp\", \"_CurveFp__p\": 115792089237316195423570985008687907853269984665640564039457584007908834671663, \"_CurveFp__a\": 0, \"_CurveFp__b\": 7, \"_CurveFp__h\": 1}, \"_PointJacobi__coords\": {\"py/tuple\": [42061361645182813955799615315130963975667366357700088616633372691937997783462, 77656889160623663461781217427226716410803694150479211056282582982285491383137, 76616234397378071434636154705270601209857693477607324750336850829315708428643]}, \"_PointJacobi__order\": 115792089237316195423570985008687907852837564279074904382605163141518161494337, \"_PointJacobi__generator\": false, \"_PointJacobi__precompute\": []}}}, {\"i\": 2, \"y\": {\"py/object\": \"ecdsa.ellipticcurve.PointJacobi\", \"py/state\": {\"_PointJacobi__curve\": {\"py/id\": 4}, \"_PointJacobi__coords\": {\"py/tuple\": [17120710671276199878422889236614952544283326916660599726604734655286829078059, 21186249964550619748981586266946977534151979662224229171013056207128672600936, 14100037835227771642537660589493187200263487294412047082758909435425497307677]}, \"_PointJacobi__order\": 115792089237316195423570985008687907852837564279074904382605163141518161494337, \"_PointJacobi__generator\": false, \"_PointJacobi__precompute\": []}}, \"k\": 28024028624095205808553994029601645953035848979501076956365458804256219618285, \"omicron\": 63547762709203214319639200477553567330752797835978657689798396305203572303205, \"delta\": 68978876483484579872765321065766861043037845981880617542895128596925837694312, \"Gamma\": {\"py/object\": \"ecdsa.ellipticcurve.PointJacobi\", \"py/state\": {\"_PointJacobi__curve\": {\"py/id\": 4}, \"_PointJacobi__coords\": {\"py/tuple\": [8723058398749528435746005285336500880570031919238885355608550905412370036018, 37734053426008908891119765268831843242842920183513258366003955245333737431, 57410576939431289340852165919661872681227389866344116686213832616745562923874]}, \"_PointJacobi__order\": 115792089237316195423570985008687907852837564279074904382605163141518161494337, \"_PointJacobi__generator\": false, \"_PointJacobi__precompute\": []}}}]'`)
    await this.state.pyodide.runPython(`mpc = thresecdsa.Ecdsa(curves.secp256k1)`)
    await this.state.pyodide.runPython(`clientSignDec = jsonpickle.decode(clientSignEnc)`)
    await this.state.pyodide.runPython(`msg = str.encode('passbird')`)
    await this.state.pyodide.runPython(`print(clientSignDec)`)
    await this.state.pyodide.runPython(`signed_message = mpc.sign(msg,(clientSignDec[0],clientSignDec[1]))`)
    await this.state.pyodide.runPython(`r = signed_message['r']`)
    await this.state.pyodide.runPython(`s = signed_message['s']`)
    // Set client signature 'r' and 's'
    this.setState({ client_r: this.state.pyodide.globals.get("r")});
    this.setState({ client_s: this.state.pyodide.globals.get("s")});
    console.log("r,s",this.state.client_r,this.state.client_s)
    this.setState({information_message:"Client Signature Completed!"});
  }

  handleChange = this.handleChange.bind(this);
  handleSubmit = this.handleSubmit.bind(this);
  handleClientKey = this.handleClientKey.bind(this);
  handleClientSign = this.handleClientSign.bind(this);

  componentDidMount() {
    window
      .loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.20.0/full/' })
      .then(async(pyodide) => {
        this.setState({ pyodide })
         await pyodide.loadPackage("https://files.pythonhosted.org/packages/d9/5a/e7c31adbe875f2abbb91bd84cf2dc52d792b5a01506781dbcf25c91daf11/six-1.16.0-py2.py3-none-any.whl")
         await pyodide.loadPackage("https://files.pythonhosted.org/packages/09/d4/4f05f5d16a4863b30ba96c23b23e942da8889abfa1cdbabf2a0df12a4532/ecdsa-0.18.0-py2.py3-none-any.whl")
         await pyodide.loadPackage("https://files.pythonhosted.org/packages/b5/de/a1d1407e0bfd396e62c9efe3261be0c76888a8f3722b9b7f61f460e0e328/pycryptodome-3.15.0-pp36-pypy36_pp73-manylinux2010_x86_64.whl");
         await pyodide.loadPackage(`https://files.pythonhosted.org/packages/53/7c/1c514f3e030ff69ee2a184fca3f1514c1d32653ca00869d884b4f981e564/phe-1.5.0-py2.py3-none-any.whl`)
         await pyodide.loadPackage("https://files.pythonhosted.org/packages/08/83/931c0f8059762ba42e28834ea93032f47a96d282e6a96a24dc380247cfd5/thresecdsa-0.1.3-py3-none-any.whl");
         await pyodide.loadPackage("https://files.pythonhosted.org/packages/f2/5d/865e17349564eb1772688d8afc5e3081a5964c640d64d1d2880ebaed002d/typing-3.10.0.0-py3-none-any.whl")
         await pyodide.loadPackage("https://files.pythonhosted.org/packages/c6/85/b4920d8087ef480eed4e7b6b0d46c90674e923e59b22e7929fd17aba5030/jsonpickle-2.2.0-py2.py3-none-any.whl")
        }).then(async(pyodide) =>{
          console.log("pyodide")
          await this.state.pyodide.runPython(`import thresecdsa`)
          await this.state.pyodide.runPython('import typing')
          await this.state.pyodide.runPython(`import thresecdsa.curves as curves`);
          await this.state.pyodide.runPython(`import jsonpickle`)
          this.setState({information_message:"Good to Go!"});
        })
      .catch((error) => {
        console.log(error)
      })
  }

  render() {
    const { serverResponse,notbadsign,information_message} = this.state;
    return (
      <div>
        <h3 className="text-center">GG-MPC-ECDSA</h3>
        <div className="row container-fluid">
          <div className='col-sm '>
              <div className="row text-center">
                  <div className="alert alert-info m-2">
                    <strong> {information_message}</strong>
                   </div>
                   <label>Upload Server Key and Client Signed Message</label>
                  <div className='col-sm'>
                    <div className="row form-group files m-2">
                       <input type="file" style={{width: "100%"}} className="form-control" multiple onChange={this.onChangeHandler}/>
                    </div>  
                  </div>
                  <div className='col-sm'>
                    <div className='row text-center'>
                       <button type="button" className="m-2 btn btn-success" onClick={this.onClickHandler}>Upload</button>
                    </div>
                  </div>
                </div>
                <div className='row text-center'>
                <div className='col-sm'>
                  <div className='row m-2'>
                    <div className="form-group">
                    <form>
                      <label id="clientKey">Paste Client Crypto Material</label>
                      <input className="form-control"  name="clientKey" 
                        value={ this.state.clientKey } 
                        onChange={ this.handleChange }
                        required />
                    </form>
                    </div>
                  </div>
                </div>
                <div className='col-sm'>
                  <div className='row text-center'>
                       <button className="m-2 btn btn-primary" onClick={ this.handleClientKey }>Save</button>
                  </div>
                </div>
            </div>
            <div className='row text-center'>
              <div className='col-sm'>
                <div className='row p-3'>
                  Perform Signature by Client
                </div>
              </div>
              <div className='col-sm'>
                <div className='row text-center'>
                       <button className="m-2 btn btn-primary" onClick={ this.handleClientSign}>Sign Client</button>
                </div>
              </div>
            </div>
            <div className='row m-2 text-center'>
              <div className='col-sm'>
                <form className='row'>
                  <div className="form-group">
                    <label id="usernameLabel">Message</label>
                    <input className="form-control"  name="message" 
                     value={ this.state.message } 
                      onChange={ this.handleChange }
                      required />
                  </div>
                </form>
              </div>
              <div className='col-sm'>
                <div className='row text-center'>
                  <button className="m-3 btn btn-primary" onClick={ this.handleSubmit }>Verify</button>            </div>
                </div>
              </div>
            <br/>
            <br />
            <div className='row text-center'>
                  {notbadsign == "True" ? serverResponse ? <p><div className="alert alert-success m-2"> <strong>{`Server Signature : r :${serverResponse.data[0]["r"]}, s:${serverResponse.data[0]["s"]}`}</strong> </div></p> : <p><div className="alert alert-danger m-2"> <strong>Bad Signature</strong> </div></p> : <p> Signature Not Verified</p>} <br />
                  {notbadsign == "True" ? serverResponse ? <p><div className="alert alert-success m-2"> <strong>{`Merged Signature : r :${serverResponse.data[1]["r"]}, s:${serverResponse.data[1]["s"]}`}</strong> </div></p> : <p></p> : <p></p>} <br />
            </div>
            <br/>
            <br/>
        </div>
        <div className='col'>
          <div className='row'>
            {<p className='p-5'>Instructions: <br/>
            1. Generate crypto materials by executing keygen.sh script on client device. <br/>
            2. Upload server key to the server. <br/>
            3. Upload signed message, signed by client key to the server. <br />
            4. Enter the message in the message box and click on Verify.
            </p>}
          </div>
        </div>
        </div>
      </div>
    );
  }
}
