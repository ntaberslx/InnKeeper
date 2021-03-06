import React, {Component} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Jumbotron, Modal, Row} from "react-bootstrap";
import _ from 'lodash';
import uuid from 'uuid';
import ReactCardFlip from 'react-card-flip';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowCircleLeft,
    faArrowCircleRight,
    faDiceD20, faFire,
    faHeart,
    faMinusCircle
} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

/*<a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@mockup_photos?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Mockup Photos"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Mockup Photos</span></a>*/
class App extends Component {
    /* Framework */
    constructor(props) {
        super(props);

        const storedData = getFromLS();

        this.state = {
            initiative: storedData.initiative ? storedData.initiative : [
                {name: "asdf", position: 20, guid: uuid.v4(), type: 'effect'},
                {name: "fdsa", position: 1, guid: uuid.v4(), type: 'player'},
                {name: "fdsa", position: 1, guid: uuid.v4(), type: 'npc'},
            ],
            thisRound: storedData.thisRound ? storedData.thisRound : [],
            nextRound: storedData.nextRound ? storedData.nextRound : [],
            roundCount: storedData.roundCount ? storedData.roundCount : 1,
        };
        if (!(storedData)) {
            saveToLS(this.state);
        }

        let isFlipped = {};
        this.state.initiative.forEach(tracked => {
            isFlipped[tracked.guid] = false;
        });
        this.state.nextRound.forEach(tracked => {
            isFlipped[tracked.guid] = false;
        });
        isFlipped[1] = false;
        this.state.isFlipped = isFlipped;


        this.state.showModal = false;
        this.state.dataModal = {};
        this.state.typeModal = '';

        this.handleFlip = this.handleFlip.bind(this);

        this.state.message = '';
        this.state.showMessage = false;
    }

    componentDidMount() {
        document.title = "InnKeeper";
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        saveToLS(this.state);
    }

    /* This is a reducer of sorts, which accepts a payload to be inserted into the state at the given key */
    save = (payload, key) => {
        this.setState((state) => {
            let returning = {};
            returning[key] = payload;
            return returning;
        });
    };

    /* Data Manipulation */

    advanceInitiative = () => {
        let thisRound = this.state.thisRound;
        let nextRound = this.state.nextRound;
        if (thisRound.length > 0) {
            nextRound.push(thisRound.shift());
            this.save(thisRound, "thisRound");
            this.save(nextRound, 'nextRound');
        } else {
            this.save(nextRound, "thisRound");
            this.save(thisRound, 'nextRound');
            this.save(this.state.roundCount + 1, 'roundCount');
        }
    };

    declineInitiative = () => {
        let thisRound = this.state.thisRound;
        let nextRound = this.state.nextRound;
        if (nextRound.length > 0) {
            thisRound.unshift(nextRound.pop());
            this.save(thisRound, "thisRound");
            this.save(nextRound, 'nextRound');
        } else if (this.state.roundCount > 1) {
            this.save(nextRound, "thisRound");
            this.save(thisRound, 'nextRound');
            this.save(this.state.roundCount - 1, 'roundCount');
        }
    };

    sortByInitiative = (a, b) => {
        return a.position - b.position;
    };

    rollInitiative = () => {
        let round = [];
        this.state.initiative.forEach((thing) => {
            round.push(thing.guid);
        });
        this.save(round, 'thisRound');
        this.save([], 'nextRound');
        this.save(1, 'roundCount');
    };

    handleFlip = (e, guid) => {
        e.preventDefault();
        let currentState = this.state.isFlipped;
        currentState[guid] = !currentState[guid];
        this.save(currentState, 'isFlipped');
    };

    confirmRemoveThingFromRounds = (e, guid) => {
        e.preventDefault();
        e.stopPropagation();
        const message = {
            copy: 'Are you sure you want to remove this from the round order?',
            subCopy: 'If you roll initiative again it will add this back',
            guid
        };
        this.save(message, "message");
        this.save(true, "showMessage")
    };

    removeThingFromRounds = (e, guid) => {
        e.preventDefault();
        e.stopPropagation();
        let thisRound = this.state.thisRound;
        let nextRound = this.state.nextRound;

        thisRound = thisRound.filter((thing) => {
            return thing !== guid;
        });
        nextRound = nextRound.filter((thing) => {
            return thing !== guid;
        });

        if (thisRound !== this.state.thisRound) {
            this.save(thisRound, "thisRound");
        }
        if (nextRound !== this.state.nextRound) {
            this.save(nextRound, "nextRound");
        }
        let isFlipped = this.state.isFlipped;
        isFlipped[guid] = false;
        this.save(isFlipped, "isFlipped");
    };


    /* Modal Control */
    handleOpenModal = (type, data = {isNew: true}) => {
        this.setState({showModal: true, typeModal: type, dataModal: data});
    };

    handleSaveModal = () => {
        let nextRound = this.state.nextRound;
        let initiative = this.state.initiative;
        let data = this.state.dataModal;
        if (data.name && data.position) {
            data.type = this.state.typeModal;
            data.guid = uuid.v4();
            data.isNew = false;
            nextRound.push(data.guid);
            initiative.push(data);
            initiative.sort(this.sortByInitiative);
            this.save(initiative, 'initiative');
            this.save(nextRound, 'nextRound');
            this.handleCloseModal();
        }
    };

    handleCloseModal = () => {
        this.setState({showModal: false, typeModal: '', dataModal: {}});
    };

    handleModalFieldChange = (field, payload) => {
        let data = this.state.dataModal;
        data[field] = payload;
        this.save(data, 'dataModal');
    };

    handleCloseMessage = () => {
        this.setState({showMessage: false, message: ''});
    };

    /* DOM */
    isFlipped = (guid) => {
        return this.state.isFlipped[guid];
    };

    getInitiative = (round) => {
        return _.map(this.state[round], (guid, i) => {
            const thing = this.state.initiative.filter((t) => {
                return t.guid === guid;
            })[0];
            if (thing) {
                return (
                    <ReactCardFlip isFlipped={this.isFlipped(thing.guid)} flipDirection="horizontal"
                                   flipSpeedBackToFront={0.2} flipSpeedFrontToBack={0.2} key={guid}>
                        <div className={"tracker-piece front"} onClick={(e) => {
                            this.handleFlip(e, thing.guid)
                        }}>
                            <Row>
                                <Col xs={1}>
                                <span>
                                    <i className="icon" style={{'verticalAlign': 'middle'}}>
                                        {(thing.type === 'npc' || thing.type === 'player') &&
                                        <FontAwesomeIcon icon={faDiceD20} size={"2x"} transform={"up-2.5 left-5"}
                                                         color={"#f7be16"}/>
                                        }
                                        {(thing.type === 'effect') &&
                                        <FontAwesomeIcon icon={faFire} size={"2x"} transform={"up-2.5 left-5"}
                                                         color={"#f7be16"}/>
                                        }
                                    </i>
                                </span>
                                </Col>
                                <Col xs={10}>
                                    {thing.name}
                                </Col>
                            </Row>
                        </div>

                        <div className={"tracker-piece back"} onClick={(e) => {
                            this.handleFlip(e, thing.guid)
                        }}>
                            <Row>
                                <Col sm={9}>
                                    {(thing.currentHealth || thing.totalHealth) && <Row>
                                        <Col sm={5}>
                                            Health
                                        </Col>
                                        <Col sm={7}>
                                            {thing.currentHealth} / {thing.totalHealth}
                                        </Col>
                                    </Row>}
                                    <Row>
                                        <Col>
                                            Roll
                                        </Col>
                                        <Col>
                                            {thing.position}
                                        </Col>
                                    </Row>
                                    {(thing.type === 'npc' && thing.behavior) && <Row>
                                        behavior
                                    </Row>}
                                    {(thing.type === 'event' && thing.duration) && <Row>
                                        Remaining Duration
                                    </Row>}
                                </Col>
                                <Col sm={3}>
                                    <i className="icon" style={{'verticalAlign': 'middle'}}
                                       onClick={(e) => this.confirmRemoveThingFromRounds(e, thing.guid)}>
                                        <FontAwesomeIcon icon={faMinusCircle} size={"2x"} transform={"up-2.5 left-5"}
                                                         color={"#6e2825"}/>
                                    </i>
                                </Col>
                            </Row>
                        </div>
                    </ReactCardFlip>
                );
            }
        });
    };

    getCategory = (type) => {
        return _.map(this.state.initiative.filter((el) => {
            return el.type === type;
        }), (object, i) => {
            return (
                <div key={type} onClick={(e) => {
                    this.handleOpenModal(type, object);
                }}>
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

                <Jumbotron fluid style={{'paddingBottom': '40px', 'paddingTop': '40px'}}>
                    <Container className={"scrollwork"}>
                        <h1>Your Friendly Local Inn(itiative) Keeper</h1>
                    </Container>
                </Jumbotron>

                <Row>
                    <Col sm={3}>
                        <Row className={"text-center"}>
                            <Col sm={4} className={'text-center'}>
                                <button className={"fancy-btn fancy-btn-sm"} onClick={this.declineInitiative}>
                                    <i className="icon">
                                        <FontAwesomeIcon
                                            icon={faArrowCircleLeft}
                                            transform={"up-2.5"} color={"#502419"}/>
                                    </i>
                                </button>
                            </Col>
                            <Col sm={4}>
                                <button className="btn-flip" data-back="Initiative" data-front="Roll"
                                        onClick={this.rollInitiative}/>
                            </Col>
                            <Col sm={4} className={'text-center'}
                                 style={{'paddingRight': '0px', 'paddingLeft': '30px'}}>
                                <button className={"fancy-btn fancy-btn-sm"} onClick={this.advanceInitiative}>
                                    <i className="icon">
                                        <FontAwesomeIcon
                                            icon={faArrowCircleRight}
                                            transform={"up-2.5"} color={"#502419"}/>
                                    </i>
                                </button>
                            </Col>
                        </Row>
                        <div className={"tracker"}>

                            {this.getInitiative('thisRound')}

                            <ReactCardFlip isFlipped={this.isFlipped(1)} flipDirection="horizontal"
                                           flipSpeedBackToFront={0.2} flipSpeedFrontToBack={0.2} key={1}>
                                <div className={"tracker-piece front"} onClick={(e) => {
                                    this.handleFlip(e, 1)
                                }}>
                                    <Row>
                                        <Col xs={12}>
                                            End of Round {this.state.roundCount}
                                        </Col>
                                    </Row>
                                </div>

                                <div className={"tracker-piece back"} onClick={(e) => {
                                    this.handleFlip(e, 1)
                                }}>
                                    <Row>
                                        {(this.state.roundCount - 1) * 6} Seconds Have Elapsed
                                    </Row>
                                </div>
                            </ReactCardFlip>

                            {this.getInitiative('nextRound')}

                        </div>
                    </Col>
                    <Col sm={9} style={{"paddingRight": "50px"}}>
                        <Row className={"no-padding"}>
                            <Col sm={4} style={{"paddingRight": "0px"}}>
                                <div className={'text-center'}>
                                    <button onClick={(e) => {
                                        this.handleOpenModal('player');
                                    }} className={"fancy-btn"} data-name={"Players"} data-new={"New Player"}/>
                                </div>
                                <div className={"categories"}>
                                    {this.getCategory('player')}
                                </div>
                            </Col>
                            <Col sm={4} style={{"paddingRight": "0px", "paddingLeft": "0px"}}>
                                <div className={'text-center'}>
                                    <button onClick={(e) => {
                                        this.handleOpenModal('npc');
                                    }} className={"fancy-btn"} data-name={"NPCs"} data-new={"New NPC"}/>
                                </div>
                                <div className={"categories"}>
                                    {this.getCategory('npc')}
                                </div>
                            </Col>
                            <Col sm={4} style={{"paddingRight": "0px", "paddingLeft": "0px"}}>
                                <div className={'text-center'}>
                                    <button onClick={(e) => {
                                        this.handleOpenModal('effect');
                                    }} className={"fancy-btn"} data-name={"Effects"} data-new={"New Effect"}/>
                                </div>
                                <div className={"categories"}>
                                    {this.getCategory('effect')}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Modal show={this.state.showModal} onHide={this.handleCloseModal} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {
                                this.state.dataModal.isNew ?
                                    "New " + this.state.typeModal.substr(0, 1).toUpperCase() + this.state.typeModal.substr(1) :
                                    "Edit " + this.state.dataModal.name
                            }
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container>
                            <form>
                                <Row>
                                    <Col sm={3}>
                                        <label>
                                            Name
                                        </label>
                                    </Col>
                                    <Col sm={9}>
                                        <input type={"text"} className={'form-control'}
                                               defaultValue={this.state.dataModal.name} onChange={e => {
                                            this.handleModalFieldChange('name', e.target.value);
                                        }}/>
                                    </Col>
                                </Row>
                                <Row className={"modal-row"}>
                                    <Col sm={3}>
                                        <label>
                                            Initiative
                                        </label>
                                    </Col>
                                    <Col sm={9}>
                                        <input type={"number"} className={'form-control'}
                                               defaultValue={this.state.dataModal.position} onChange={e => {
                                            this.handleModalFieldChange('position', e.target.value);
                                        }}/>
                                    </Col>
                                </Row>

                                {(this.state.typeModal === 'player' || this.state.typeModal === 'npc') &&
                                <Row className={"modal-row"}>
                                    <Col sm={3}>
                                        <label>
                                            Health (current/max)
                                        </label>
                                    </Col>
                                    <Col sm={4}>
                                        <input type={"number"} className={'form-control'}
                                               defaultValue={this.state.dataModal.currentHealth} onChange={e => {
                                                   if (!this.state.dataModal.totalHealth || this.state.dataModal.totalHealth < e.target.value){
                                                       this.handleModalFieldChange('totalHealth', e.target.value);
                                                   }
                                            this.handleModalFieldChange('currentHealth', e.target.value);
                                        }}/>
                                    </Col>
                                    <Col sm={1}>
                                        <i className="icon" style={{'verticalAlign': 'middle', 'horizontalAlign':'middle'}}>
                                            <FontAwesomeIcon icon={faHeart} size={"2x"}
                                                             color={"#f7be16"}/>
                                        </i>
                                    </Col>
                                    <Col sm={4}>
                                        <input type={"number"} className={'form-control'}
                                               defaultValue={this.state.dataModal.totalHealth} onChange={e => {
                                            this.handleModalFieldChange('totalHealth', e.target.value);
                                        }}/>
                                    </Col>
                                </Row>}

                                {(this.state.typeModal === 'npc') &&
                                <Row className={"modal-row"}>
                                    <Col sm={3}>
                                        <label>
                                            Behavior Blurb
                                        </label>
                                    </Col>
                                    <Col sm={9}>
                                        <textarea className={'form-control'}
                                                  defaultValue={this.state.dataModal.behavior} onChange={e => {
                                            this.handleModalFieldChange('behavior', e.target.value);
                                        }}/>
                                    </Col>
                                </Row>}

                                {this.state.typeModal === 'effect' &&
                                <Row className={"modal-row"}>
                                    <Col sm={3}>
                                        <label>
                                            Duration (Rounds)
                                        </label>
                                    </Col>
                                    <Col sm={9}>
                                        <input type={"number"} className={'form-control'}
                                               defaultValue={this.state.dataModal.duration} onChange={e => {
                                            this.handleModalFieldChange('duration', e.target.value);
                                        }}/>
                                    </Col>
                                </Row>}
                            </form>
                        </Container>
                    </Modal.Body>

                    <Modal.Footer>
                        {!this.state.dataModal.isNew && <Button variant="dark" onClick={this.handleCloseModal}>
                            Close
                        </Button>}
                        {this.state.dataModal.isNew && <Button variant="danger" onClick={this.handleCloseModal}>
                            Cancel
                        </Button>}
                        {this.state.dataModal.isNew && this.state.dataModal.name && this.state.dataModal.position &&
                        <Button variant="success" onClick={this.handleSaveModal}>
                            Save
                        </Button>}
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showMessage} onHide={this.handleCloseMessage} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {this.state.message.copy}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.message.subCopy}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleCloseMessage}>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={(e) => {
                            this.removeThingFromRounds(e, this.state.message.guid);
                            this.handleCloseMessage();
                        }}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
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
