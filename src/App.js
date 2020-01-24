import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Jumbotron, Row} from "react-bootstrap";

/*<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@mockup_photos?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Mockup Photos"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Mockup Photos</span></a>*/
class App extends Component {
    constructor(props) {
        super(props);

        const storedData = getFromLS();

        this.state = {

        };
        if (!(storedData)){
            saveToLS({

            });
        }
    }

    state = {
        nameInput: null,
        currentBreakpoint: "lg",
        compactType: "vertical",
        mounted: false,
        showModal: false
    };

    componentDidMount() {
        document.title = "InnKeeper";
    }


    render() {
        return (
            <div className={"app-body"}>

                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
                    crossOrigin="anonymous"/>

                <Jumbotron fluid>
                    <Container className={"scrollwork"}>
                        <h1>Your Friendly Local Inn(itiative) Keeper</h1>

                        <p>https://www.npmjs.com/package/react-card-flip</p>
                    </Container>
                </Jumbotron>

                <Row>
                    <Col sm={3}>
                        <div className={"text-center"}>
                            <button className="btn-flip" data-back="Initiative" data-front="Roll"/>
                        </div>
                        <div className={"tracker"}>
                            K8LL M8 K8LL M8 K8LL M8 K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL
                            M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8K8LL M8
                        </div>
                    </Col>

                    <Col sm={3}>
                        <p>
                            People are actors in the world who have turns and need to take them. Track their position in the
                            order, health, lingering effects, and otherwise!
                        </p>
                    </Col>
                    <Col sm={3}>
                        <p>
                            Events are trackables that happen according to their absolute position in the game world; at
                            round 5, Orcs Attack!
                        </p>
                    </Col>
                    <Col sm={3}>
                        <p>
                            Effects constitute a subsection of trackable things that attach to actors' turns, or initiative
                            numbers, or rounds, or nothing. They may be a lingering fire that will go out, a spell effect,
                            or a very slow bullet flying through the air
                        </p>
                    </Col>
                </Row>

            </div>
        )
    };
}

function getFromLS() {
    let ls = {};
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem("PvP")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls;
}

function saveToLS(values) {
    if (global.localStorage) {
        global.localStorage.setItem(
            "PvP",
            JSON.stringify(values)
        );
    }
}

export default App;
