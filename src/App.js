import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Jumbotron, Row} from "react-bootstrap";
import _ from 'lodash';
import uuid from 'uuid';
import ReactCardFlip from 'react-card-flip';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowCircleRight, faArrowCircleLeft} from "@fortawesome/free-solid-svg-icons";

/*<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@mockup_photos?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Mockup Photos"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Mockup Photos</span></a>*/
class App extends Component {
    /* Framework */
    constructor(props) {
        super(props);

        const storedData = getFromLS();

        this.state = {
            initiative : storedData.initiative ? storedData.initiative : [
                {name : "asdf", position : 20, guid: uuid.v4(), type: 'event'},
                {name : "fdsa", position : 1, guid: uuid.v4(), type: 'character'},
                {name : "Round ", position : -99, guid: uuid.v4(), type: 'roundMarker'},
            ],
            onDeck : storedData.onDeck ? storedData.onDeck : [],
        };
        if (!(storedData)){
            saveToLS(this.state);
        }

        let isFlipped = {};
        this.state.initiative.forEach(tracked => {
            isFlipped[tracked.guid] = false;
        });
        this.state.onDeck.forEach(tracked => {
            isFlipped[tracked.guid] = false;
        });
        this.state.isFlipped = isFlipped;

        this.handleFlip = this.handleFlip.bind(this);
    }

    componentDidMount() {
        document.title = "InnKeeper";
    }

    componentDidUpdate() {
        saveToLS(this.state);
    }

    /* This is a reducer of sorts, which accepts a payload to be inserted into the state at the given key */
    save = (payload, key) => {
        this.setState((state) =>{
            let returning = {};
            returning[key] = payload;
            return returning;
        });
    };

    /* Data Manipulation */

    advanceInitiative = () => {
        let initiative = this.state.initiative;
        let onDeck = this.state.onDeck;
        onDeck.push(initiative.shift());
        this.save(initiative, "initiative");
        this.save(onDeck);
    };

    declineInitiative = () => {
        let initiative = this.state.initiative;
        let onDeck = this.state.onDeck;
        initiative.unshift(onDeck.pop());
        this.save(initiative, "initiative");
        this.save(onDeck);
    };

    sortByInitiative = (a, b) => {
        return a.position - b.position;
    };

    addToInitiative = (object, onDeck = true) => {
        if (onDeck) {
            let currentState = this.state.onDeck;
            currentState.push(object);
            currentState.sort(this.sortByInitiative);
            this.save(currentState, 'onDeck');
        }else {
            let currentState = this.state.initiative;
            currentState.push(object);
            currentState.sort(this.sortByInitiative);
            this.save(currentState, 'initiative');
        }
    };

    handleFlip = (e, guid) => {
        e.preventDefault();
        let currentState = this.state.isFlipped;
        currentState[guid] = !currentState[guid];
        this.save(currentState, 'isFlipped');
    };

    /* DOM */
    isFlipped = (guid) => {
        return this.state.isFlipped[guid];
    };

    getInitiative = () => {
        return _.map(this.state.initiative, (object, i) => {
            return (
                <ReactCardFlip isFlipped={this.isFlipped(object.guid)} flipDirection="horizontal" flipSpeedBackToFront={0.2} flipSpeedFrontToBack={0.2} key={object.guid}>
                    <div className={"tracker-piece front"} onClick={(e)=>{this.handleFlip(e, object.guid)}}>
                        <Row>
                            <Col xs={1}>
                                <Row>
                                    sym
                                </Row>
                                <Row>
                                    {object.position}
                                </Row>
                            </Col>
                            <Col xs={10}>
                                {object.name} {object.type}
                            </Col>
                        </Row>
                    </div>

                    <div className={"tracker-piece back"} onClick={(e)=>{this.handleFlip(e, object.guid)}}>
                        <Row>
                            Back
                        </Row>
                    </div>
                </ReactCardFlip>
            );
        });
    };

    getCategory = (type) => {
        return _.map(this.state.initiative.filter((el) => {
            console.log(el);
            return el.type === type;
        }), (object, i) => {
            console.log(object, type);
            return (
                <div>
                    {object.name}
                </div>
            );
        });
    };

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
                    </Container>
                </Jumbotron>

                <Row>
                    <Col sm={3}>
                        <Row className={"text-center"}>
                            <Col sm={4} className={'text-center'}>
                                <button className={"fancy-btn fancy-btn-sm"}>
                                    <i className="icon">
                                        <FontAwesomeIcon
                                            icon={faArrowCircleLeft}
                                            size={"md"} transform={"up-2.5"} color={"#000"}/>
                                    </i>
                                </button>
                            </Col>
                            <Col sm={4}>
                                <button className="btn-flip" data-back="Initiative" data-front="Roll"/>
                            </Col>
                            <Col sm={4} className={'text-center'} style={{'paddingRight':'0px', 'paddingLeft':'30px'}}>
                                <button className={"fancy-btn fancy-btn-sm"}>
                                    <i className="icon">
                                        <FontAwesomeIcon
                                            icon={faArrowCircleRight}
                                            size={"md"} transform={"up-2.5"} color={"#000"}/>
                                    </i>
                                </button>
                            </Col>
                        </Row>
                        <div className={"tracker"}>
                            {this.getInitiative()}
                        </div>
                    </Col>
                    <Col sm={9} style={{"paddingRight": "50px"}}>
                        <Row className={"no-padding"}>
                            <Col sm={4} style={{"paddingRight":"0px"}}>
                                <div className={'text-center'}>
                                    <button className={"fancy-btn"} data-name={"Characters"} data-new={"New Character"}/>
                                </div>
                                <div className={"categories"}>
                                    {this.getCategory('character')}
                                </div>
                            </Col>
                            <Col sm={4} style={{"paddingRight":"0px", "paddingLeft":"0px"}}>
                                <div className={'text-center'}>
                                    <button className={"fancy-btn"} data-name={"Effects"} data-new={"New Effect"}/>
                                </div>
                                <div className={"categories"}>
                                    {this.getCategory('effect')}
                                </div>
                            </Col>
                            <Col sm={4} style={{"paddingLeft":"0px"}}>
                                <div className={'text-center'}>
                                    <button className={"fancy-btn"} data-name={"Events"} data-new={"New Event"}/>
                                </div>
                                <div className={"categories"}>
                                    {this.getCategory('event')}
                                </div>
                            </Col>
                        </Row>
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
            ls = JSON.parse(global.localStorage.getItem("InnKeepersBrew")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls;
}

function saveToLS(values) {
    if (global.localStorage) {
        global.localStorage.setItem(
            "InnKeepersBrew",
            JSON.stringify(values)
        );
    }
}

export default App;
