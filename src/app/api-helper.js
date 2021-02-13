import axios from 'axios';

let HOST_SERVER_NAME = "TEST";
// let HOST_SERVER_NAME = "PROD";

let https = require('https');

let myInterceptor;

if (!myInterceptor) {
    myInterceptor = axios.interceptors.request.use(function (config) {
    config.timeout = 0.5 * 60 * 1000;

    config.headers['Content-Type'] = 'application/json';
    config.headers['Access-Control-Allow-Credentials'] = true;
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    config.httpsAgent = agent;
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  axios.interceptors.response.use(function (response) {
    if (response && response.data) {
      return response.data;
    }
    return Promise.reject(response);
  }, function (error) {

    let response = {
      data: {
        message: ''
      }
    }
    if (error.message && error.message.toLowerCase().indexOf("timeout") > -1) {
      response.data.message = "Unable to connect with server. Please try again later.";
    } else if (error.message && error.message.toLowerCase().indexOf("network") > -1) {
      response.data.message = error.message;
    }
    if (response.data.message) {
      error['response'] = response;
    }
    return Promise.reject(error);
  });
}
axios.defaults.withCredentials = true;
function getHostName() {
  if (HOST_SERVER_NAME == "PROD") {
    return 'https://sfe-api.herokuapp.com';//'http://ec2-18-236-146-143.us-west-2.compute.amazonaws.com'; //AWS PROD
  } else {
    return 'https://sfe-api.herokuapp.com';//'http://ec2-18-236-146-143.us-west-2.compute.amazonaws.com'; //AWS TEST
  }
}

let fileHeader = {
  'Content-Type': 'multipart/form-data'
}

//Teacher Login
export function teacherLogin(body) {
  return axios.post(`${getHostName()}/api/v1/auth/login`, body);
}

//Student Login
export function studentLogin(body) {
  return axios.post(`${getHostName()}/api/v1/auth/student/login`, body);
}

//Get Students
export function getStudentList(){
  return axios.get(`${getHostName()}/api/v1/student`);
}

//Add a Student
export function addStudent(body){
  return axios.post(`${getHostName()}/api/v1/student`, body);
}

//Add a Student in bulk
export function addStudentInBulk(file){
  return axios.post(`${getHostName()}/api/v1/student/bulk`, file, {headers: fileHeader});
}

//Update a Student
export function updateStudent(id, body){
  return axios.put(`${getHostName()}/api/v1/student/${id}`, body);
}

//Delete a Student /api/v1/student
export function deleteStudent(id){
  return axios.put(`${getHostName()}/api/v1/student/?studentId=${id}`);
}