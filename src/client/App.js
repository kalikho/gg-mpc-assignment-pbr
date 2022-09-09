import React, { Component } from 'react';
import './app.css';
import axios from 'axios';

export default class App extends Component {
  state = { selectedFile: null,uid:"", message: "", serverResponse : null, notbadsign : null };

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
    const message = this.state.message;
    console.log("Submitted message is: ", message)
    const uid = Math.floor(Math.random() * 100);;
    var status = "Processing";
    var interval = setInterval(() => { 
        axios.post("/api/sign",null, { params: {message,uid}}).then(res => { // then print response status
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
          this.setState({ notbadsign: "False"});
          console.log("Printing Bad Signature",this);
          status = "completed";
          clearInterval(interval);
        }
      })
    },500)
  }

  handleChange = this.handleChange.bind(this);
  handleSubmit = this.handleSubmit.bind(this);

  render() {
    const { serverResponse,notbadsign} = this.state;
    return (
      <div>
        <h3 className="text-center">GG-MPC-ECDSA</h3>
        <div className="row container-fluid">
          <div className='col-sm '>
          <div className="row text-center">
                <div className="form-group files">
                  <label>Upload Server Key and Client Signed Message</label>
                  <input type="file" className="form-control" multiple onChange={this.onChangeHandler}/>
                </div>  
                <div className='text-center'>
                  <button type="button" className="m-2 btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
                </div>
            </div>
            <div className='row text-center'>
              <form>
                <div className="form-group">
                  <label id="usernameLabel">Message</label>
                  <input className="form-control"  name="message" 
                    value={ this.state.message } 
                    onChange={ this.handleChange }
                    required />
                </div>
                <button className="m-2 btn btn-primary" onClick={ this.handleSubmit }>Verify</button>
              </form>
            </div>
            <br/>
            <br />
            <div className='row text-center'>
                  {notbadsign == "True" ? serverResponse ? <p>{`Server Signature : r :${serverResponse.data[0]["r"]}, s:${serverResponse.data[0]["s"]}`}</p> : <p>Bad Signature</p> : <p> Signature Not Verified</p>} <br />
                  {notbadsign == "True" ? serverResponse ? <p>{`Merged Signature : r :${serverResponse.data[1]["r"]}, s:${serverResponse.data[1]["s"]}`}</p> : <p>Bad Signature</p> : <p> Signature Not Verified </p>} <br />
            </div>
        </div>

        <div className='col'>
          <div className='row'>
            {<p className='p-5'>Instructions: <br/>
            1. Generate crypto materials by executing keygen.sh script. <br/>
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
