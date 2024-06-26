import React, {useState, useContext, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import QuestionAttempt from './QuestionAttempt.js'
import { useLocation } from "react-router-dom";
import {setQuizAttemptId} from "../redux/quiz_att_id.js"
import QuestionResponse from "./QuestionResponse.js";
//import SubmitButton from "./SubmitButton.js";
import NextButton from "./NextButton.js";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useExitPrompt from './useExitPrompt.js'
import axios from "axios";
import { SocketContext } from "./App.js";
import { setNextButtonFlag } from "../redux/nextbuttonflag.js";
import LiveScoreBoard from "./LiveScoreBoard.js";

export default function QuizAttempt(props) {
  const rootpath = useSelector((state) => state.rootpath.value)  
  const user = useSelector((state) => state.user.value) 
  const livequizflag = useSelector((state) => state.livequizflag.value) 
  
  const dispatch = useDispatch()  
    const [currentquestionnumber, setCurrentQuestionNumber] = useState(null)
    const [question, setQuestion] = useState(null) 
    const [showQuestion, setShowQuestion] = useState(false)
    const [showAttemptResponse, setShowQuestionAttemptResponse] = useState(false)
    const [questionAttemptId, setQuestionAttemptId] = useState(null)
    const [attemptResponse, setAttemptResponse] = useState(null)
    const [showExitPrompt, setShowExitPrompt] = useExitPrompt(true);
    
    //const [livequizready, setLiveQuizReady] = useState(false)

    const socket = useContext(SocketContext);

    
    const location = useLocation()
    //console.log("MMMMMM location",location)
    const parts = location.pathname.split('/')
    //console.log("NNNNNNNN parts",parts)
    const quizid = parts[parts.length-1]
    //console.log("UUUUUUUUU quizid"+quizid)
    const url = rootpath + "/api/quiz_attempts/find_create/" + quizid + '/' + user.user_name
    //console.log("YYYYYY quizid"+quizid)
   //const url = rootpath + "/api/quiz_attempts/find_create/" + quizid + '/' + "basic2"

   /*
   const handleClick = (e) => {
    e.preventDefault();
    setShowExitPrompt(!showExitPrompt)
  }
  //use a Button to toggle showExitPrompt. For now, showExitPrompt is always set to true
  https://dev.to/eons/detect-page-refresh-tab-close-and-route-change-with-react-router-v5-3pd
  */

  useEffect(() => {
    socket.on('enable_next_button', (arg, callback) => {
        console.log(" in QuizAttempt received next button arg: ", arg)
        console.log("current question number:"+currentquestionnumber)
        callback({status: "I got the enable_next_button message. OK", user_name: user.user_name, last_question_number: currentquestionnumber});
        if (!arg.to_student) {
          //console.log("NO STUDENT")
          dispatch(setNextButtonFlag(arg.enable_flag))
        }
        else if (arg.to_student === user.user_name) {  ////is this for me?
          dispatch(setNextButtonFlag(arg.enable_flag))
        }
        else {
          console.log("enable_next_button message is not intended for me or Error with student name in enable_next_button message")
        }
    })
    return () => {
      socket.off("enable_next_button")
  }   
  },[socket, dispatch, user.user_name, currentquestionnumber])
  
  //NOTE: this similar to componentWillUnmount()
  useEffect(() => {
    return () => {
      setShowExitPrompt(false)
    }
    //eslint-disable-next-line
  }, [])

    const setTheNextQuestion = (value) => {
      //console.log(" IN setTheNextQuestion value=", value)
        setQuestion(value)
        setCurrentQuestionNumber(value.question_number)
        setShowQuestionAttemptResponse(false)
        
    }

    const setTheAttemptResponse = (value) => {
      //this function is called in QuestionAttempt after it finishes
      //processing the question attempt and a response is returned
      setAttemptResponse(value)
      setShowQuestionAttemptResponse(true)
   }

  useEffect(() => {
    //console.log(" 3) in QuizAttempt useEffect.About to call axios to find/create quiz attempt url ="+url)
    axios.get(url).then((response) => {
      //console.log('  QuizAtt in useEffect server response data=',response.data)
      //first, disable live quiz flag. This is important (See SubmitButton.js and LiveSubmitButton.js)
      //dispatch(setLiveQuizFlag(false))
      setTheNextQuestion(response.data.question)
      setShowQuestion(true)
      setQuestionAttemptId(response.data.question_attempt_id)
      dispatch(setQuizAttemptId(response.data.quiz_attempt_id))
      
    });
    
},[url, dispatch]);

const setShowQuestionFlag = (value) => {
       setShowQuestion(value)
    }

    const setTheQuestionAttemptId = (value) => {
      //this function is called in NextButton upon a question_attempt_id is created
      //from the server
       setQuestionAttemptId(value)
    }

      return ( 
        <>
        <Container>
      <Row>
      <Col style={{backgroundColor:'#e6d3c3'}} xs={10}>
        {(showQuestion) ?
          <QuestionAttempt 
            question={question} 
            setShowQuestion={setShowQuestionFlag}
            setAttemptResponse={setTheAttemptResponse}
            questionAttemptId={questionAttemptId}
          />
          :
          <>
            {showAttemptResponse && <QuestionResponse question={question} response_content={attemptResponse} />}
          <NextButton 
              next_question_number={currentquestionnumber +1} 
              setNextQuestion={setTheNextQuestion}
              setShowQuestion={setShowQuestionFlag}
              setQuestionAttemptId={setTheQuestionAttemptId}
            />
            
          </>
        }
        </Col>
        <Col style={{backgroundColor:'#92cfd6'}} xs={2}>
          { livequizflag &&
            <LiveScoreBoard />
          }
        </Col>
      </Row>
    </Container>   
       </>
       )
    
}

