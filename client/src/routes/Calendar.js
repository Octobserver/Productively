import Calendars from "../components/Calendars";
import { myContext } from '../Context';
import {Link, Route} from "react-router-dom";
import React, {useState, useContext, useEffect} from "react";
import styled from "styled-components";
import axios from 'axios';
import Login from "../components/Login";

function Calendar() {
    const [toggle, setToggle] = useState(false);

    const logout = () => {
        axios.get("http://localhost:8080/auth/logout", {
            withCredentials: true
        }).then(res => {
            if (res.data === "done") {
                window.location.href = "/"
            }
        })
    }

    // Handle when the user creates the create task button
    function handleOnClick(){
        setToggle(!toggle);
    }

    const userObject = useContext(myContext);
    console.log('user object :' + userObject);

    return (
        <Container>
            <SidebarWrapper>
                <InfoWrapper>
                    <PicWrapper>
                        {
                            userObject ? (
                                <PicStyle
                                    src={userObject.picture}
                                    alt="profile picture"/>
                            ) : (
                                <h3>none</h3>
                            )
                        }
                    </PicWrapper>
                    {
                        userObject ? (
                            <p>{userObject.name}</p>
                        ) : (
                            <p>FirstName LastName</p>
                        )
                    }
                </InfoWrapper>
                <NavWrapper>
                    <FocusNavElement>
                        <Focus> </Focus>
                        <Link to="/home" style={focusLinkStyle}>Calendar</Link>
                    </FocusNavElement>
                    <NavElement>
                        <Link to="/tasks" style={linkStyle}>Tasks</Link>
                    </NavElement>
                    <NavElement>
                        <Link to="/tracker" style={linkStyle}>Goal Tracker</Link>
                    </NavElement>
                    <NavElement>
                        <Link to="/resources" style={linkStyle}>Resources</Link>
                    </NavElement>
                </NavWrapper>
                <LogoutElement>
                    <Link to="/" style={logoutStyle} onClick={logout}>Log Out</Link>
                </LogoutElement>
            </SidebarWrapper>
            {/*<button className='btn-primary' onClick={logOut}>Log Out</button>*/}
            <ParentWrapper>
                <SubParentWrapper selected={toggle}>
                    <TopWrapper>
                        <CalendarWrapper>
                            <Calendars/>
                        </CalendarWrapper>
                        {/*<ButtonWrapper>
                            <TaskButton onClick={handleOnClick}/>
                        </ButtonWrapper>*/}
                    </TopWrapper>
                </SubParentWrapper>
            </ParentWrapper>
            {/*toggle && <Task onClick={handleOnClick}/>*/}
        </Container>
    )
}

export default Calendar;

const ParentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify_content: center;
    padding:0px;
    overflow-y: hidden;
    overflow-x: hidden;
`;

const SubParentWrapper = styled.div`
    // background-color: purple;
    ${props => props.selected === true && `
        display: flex;
        flex-direction: column;
        justify_content: center;
        width: 80vw;
        padding:0px;
        overflow-y: hidden;
        overflow-x: hidden;
        // background-color: red;
    `}
`

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  // background: blue;
  flex-grow:1;
`;

const CalendarWrapper = styled.div`
  display: flex;
  flex-grow:1;
`;

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    background: #F6F6F2;
    font-family: 'Proxima Nova';
    text-transform: uppercase;
    font-size: 1em;
    display: flex;
    flex-flow: row;
`

const InfoWrapper = styled.div`
    width: 100%;
    order: 1;
    color: #F6F6F2;
    margin: 2em 0 3em 0;
    display: flex;
    align-items: center;
    flex-flow: column nowrap;
`

const PicWrapper = styled.div`
    height: 75px;
    width: 75px;
    border-radius: 50%;
    background: #F6F6F2;
    margin: 1.5em;
`

const SidebarWrapper = styled.div`
    background: #377F87;
    left: 0;
    height: 100vh;
    min-width: 23vw;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
`

const NavWrapper = styled.div`
    width: 75%;
    height: 100%;
    order: 2;
`

const NavElement = styled.div`
    text_decoration: none;
    margin: 2.5em 0 2.5em 3em;
`

const FocusNavElement = styled(NavElement)`
    display: flex;
    margin: 2.5em 0 2.5em 0;
    padding: 0;
`

const Focus = styled.div`
    height: 1.25em;
    width: 5px;
    order: 1;
    background: #F6F6F2;
    left: 0,
`

const LogoutElement = styled.div`
    order: 3;
    color: #F6F6F2;
    margin: 2.5em 0 2.5em 3em;
`

const logoutStyle = {
    color: '#F6F6F2',
    textDecoration: 'none',
}

const linkStyle = {
    textDecoration: 'none',
    color: '#BADFE7'
}

const focusLinkStyle = {
    color: '#F6F6F2',
    textDecoration: 'none',
    order: 2,
    marginLeft: '2.7em',
}

const PicStyle = styled.img`
    height: 75px;
    width: 75px;
    border-radius: 50%;
`