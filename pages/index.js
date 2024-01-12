import React, { useEffect, useState } from 'react';
import { Web5 } from "@web5/api";
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 400px;
  margin: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  color: white;
`;

const Input = styled.input`
  padding: 8px;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px;
  cursor: pointer;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #391942;
`;

const Title = styled.h1`
  color: #e6cced;
  font-size: 2em;
`;

const HeaderContainer = styled.header`
  background-color: #333;
  color: green;
  padding: 1rem;
  text-align: center;
`;

function Index() {

  const [credentialJwt, setMessage] = useState("Loading...")
  const [signedVcJwt, setJwt] = useState("Generate your Token by Clicking")
  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);
  const [state, setState] = useState(true);
  const [DwnLength, setLen] = useState(0);
  const [counter, setCounter] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    sharedsecret: ""
  });
  const [token, setToken] = useState(0);
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")
  const totp = require("totp-generator");



  const writeToDwn = async (credentialJwt) => {
    const { record } = await web5.dwn.records.write({
      data: credentialJwt,
      message: {
        schema: 'EmploymentCredential',
      },
    });
    return record;
  };

  const readFromDwn = async (web5, myDid) => {
    const response = await web5.dwn.records.query({
      from: myDid,
      message: {
        filter: {
          schema: 'EmploymentCredential',
        },
      },
    });
    const len = response.records.length;
    setLen(len);
    console.log("Send record status", response);
    const signedVcJwt = response.records[len-1].data.text();
    return signedVcJwt;
  };

  useEffect(() => {
    const initWeb5 = async () => {
      const { web5, did } = await Web5.connect();
      setWeb5(web5);
      setMyDid(did);
    };
    initWeb5();
  }, []);

  const handleInput = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }

  const submitForm = async (e) => {
    // We don't want the page to refresh
    e.preventDefault()

    const formURL = e.target.action
    const data = new FormData()

    // Turn our formData state into data we can use with a form submission
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    })

    // POST the data to the URL of the form
    fetch("/api/hello", {
      method: "POST",
      body: data,
      headers: {
        'accept': 'application/json',
      },
    }).then((response) => response.json())
    .then((data) => {
      setFormData({
        email: "",
        sharedsecret: ""
      })
      console.log(formData)
      // setFormSuccess(true)
     // setFormSuccessMessage(data.submission_text)

    })

    setState(!state);
    if (state === true) {
      setCounter(counter +1);

    } else {
      setCounter(counter -1);

    }

    fetch("http://localhost:3001/issue?userDid=" + myDid + "&Email=" + formData.email + "&SharedSecret=" + formData.sharedsecret, ) 
    .then(
      response => response.json()
    )
    .then(  
      data => {
        setMessage(data.credentialJwt)
      }
    )
    const record = await writeToDwn(credentialJwt);
    const response = await readFromDwn(web5, myDid);
    const token = totp(formData.sharedsecret);
    setToken(token);

  }

  return (
    <>
    <Container>
        <Title>CredPass - One Place for all Logins</Title>
      </Container>
      <Container>
      <FormContainer>
        <Form onSubmit={submitForm}>
            <Label htmlFor="Email">Email:</Label>
            <Input type="text" name="email" onChange={handleInput} value={formData.email} />
      
            <Label htmlFor="Shared Secret">Shared Secret:</Label>
            <Input type="text" name="sharedsecret" onChange={handleInput} value={formData.sharedsecret}/>
      
          <Button type="submit">Generate Credential</Button>
        </Form>
      </FormContainer>
      </Container>
      <Container>
      
      <HeaderContainer>
      <div>{credentialJwt}</div>
      <div>{token}</div>
      </HeaderContainer>
      </Container>
    </>
  )
}

export default Index