import React, { useContext, useState } from "react";
import Flux from "@4geeksacademy/react-flux-dash";
import PropTypes from 'prop-types';
import { store, search, fetchTemporal, GET } from '../actions.js';
import { callback, hasTutorial } from '../utils/tutorial';
import { GenericCard, Avatar, Stars, Theme, Button, Wizard, StarRating, SearchCatalogSelect } from '../components/index';
import Select from 'react-select';
import queryString from 'query-string';
import { Session } from 'bc-react-session';
import moment from 'moment';
import { Notify } from 'bc-react-notifier';
import { NOW } from "../components/utils.js";

//gets the querystring and creats a formData object to be used when opening the rightbar
export const getRatingInitialFilters = (catalog) => {
    let query = queryString.parse(window.location.search);
    if (typeof query == 'undefined') return {};
    if (!Array.isArray(query.positions)) query.positions = (typeof query.positions == 'undefined') ? [] : [query.positions];
    if (!Array.isArray(query.badges)) query.badges = (typeof query.badges == 'undefined') ? [] : [query.badges];
    return {
        positions: query.positions.map(pId => catalog.positions.find(pos => pos.value == pId)),
        badges: query.badges.map(bId => catalog.badges.find(b => b.value == bId)),
        rating: catalog.stars.find(rate => rate.value == query.rating)
    };
};

export const Rating = (data) => {

    const session = Session.getPayload();
    const _defaults = {
        //foo: 'bar',
        serialize: function () {

            const newRating = {
                comments: '',
                rating: 5,
                sender: null,
                shift: null,
                created_at: NOW()
            };

            return Object.assign(this, newRating);
        },
        unserialize: function () {
            //this.fullName = function() { return (this.user.first_name.length>0) ? this.user.first_name + ' ' + this.user.last_name : 'No name specified'; };
            let shift = null;
            if (this.shift) {
                shift = {
                    ...this.shift,
                    starting_at: moment(this.shift.starting_at),
                    ending_at: moment(this.shift.ending_at)
                };
            }

            return { ...this, shift };
        }

    };

    let _entity = Object.assign(_defaults, data);
    return {
        validate: () => {

            return _entity;
        },
        defaults: () => {
            return _defaults;
        },
        getFormData: () => {
            const _formRating = {
                id: _entity.id,
                comments: _entity.comments,
                rating: _entity.rating,
                sender: _entity.sender,
                shift: _entity.shift ?
                    {
                        ..._entity.shift,
                        starting_at: moment(_entity.shift.starting_at),
                        ending_at: moment(_entity.shift.ending_at)
                    }
                    : null,
                created_at: (moment.isMoment(_entity.created_at)) ? _entity.created_at : moment(_entity.created_at)
            };
            return _formRating;
        },
        filters: () => {
            const _filters = {
                //positions: _entity.positions.map( item => item.value ),
            };
            for (let key in _entity) if (typeof _entity[key] == 'function') delete _entity[key];
            return Object.assign(_entity, _filters);
        }
    };
};

export class ManageRating extends Flux.DashView {

    constructor() {
        super();
        this.state = {
            ratings: [],
            runTutorial: hasTutorial(),
            steps: [],
            employer: null
        };
    }

    componentDidMount() {

        this.filter();
        this.subscribe(store, 'ratings', (ratings) => {
            this.setState({ ratings });
        });

        this.props.history.listen(() => {
            this.filter();
            this.setState({ firstSearch: false });
        });
        this.setState({ runTutorial: true });

        fetchTemporal('employers/me', 'current_employer');
        this.subscribe(store, 'current_employer', (employer) => {
            this.setState({ employer });
        });
    }

    filter(ratings = null) {
        search('ratings', window.location.search);
    }

    render() {
        return (<div className="p-1 listcontents">
            <Theme.Consumer>
                {({ bar }) => (<span>
                    <Wizard continuous
                        steps={this.state.steps}
                        run={this.state.runTutorial}
                        callback={callback}
                    />
                    <h2>Company Ratings</h2>
                    <div className="row mt-2">
                        <div className="col-6">
                            <label>Total Ratings</label>
                            <p>You have been rated <span className="text-success">{this.state.employer ? this.state.employer.total_ratings : "0"} times.</span></p>
                        </div>
                        <div className="col-6">
                            <label>Rating</label>
                            <p>Talents rated you with <span className="text-success">{this.state.employer ? this.state.employer.rating : "0"} points avg.</span></p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <h3>Recent Ratings</h3>
                            {this.state.ratings.map((rate, i) => (
                                <GenericCard key={i} hover={true} onClick={() => bar.show({ slug: "show_single_rating", data: rate, allowLevels: false })}>
                                    <Avatar url={rate.sender.picture} />
                                    <Stars className="float-left" rating={Number(rate.rating)} />
                                    <span>{`  on ${rate.created_at.substring(0, 10)}`}</span>
                                    <p className="mt-0">{rate.comments !== '' ? `"${rate.comments}"` : `The talent didn't provide any comments for this rating.`}</p>
                                </GenericCard>
                            ))}
                        </div>
                    </div>
                </span>)}
            </Theme.Consumer>
        </div>);
    }
}


/**
 * Talent Details
 */
export const RatingDetails = (props) => {
    const { formData } = props;
    const { shift } = formData;
    return (<Theme.Consumer>
        {({ bar }) =>
            (<li className="aplication-details">
                <Avatar url={formData.sender.picture} />
                <p>{formData.sender.user.first_name + ' ' + formData.sender.user.last_name}</p>
                <div>
                    <Stars rating={Number(formData.rating)} />
                </div>
                <h5 className="mt-3">
                    {formData.comments !== '' ? `"${formData.comments}"` : `${formData.sender.user.first_name} didn't provide any comments for this rating.`}
                </h5>
                {!shift || typeof shift.position === 'undefined' ?
                    'Loading shift information...' :
                    <div>
                        <a href="#" className="shift-position">{shift.position.title}</a> @
                        <a href="#" className="shift-location"> {shift.venue.title}</a>
                        <span className="shift-date"> {shift.starting_at.format('ll')} from {shift.starting_at.format('LT')} to {shift.ending_at.format('LT')} </span>
                    </div>
                }
                <Button color="primary" onClick={() => bar.show({ slug: "review_talent", data: formData.sender, allowLevels: false })}>Rate talent back</Button>
            </li>)}
    </Theme.Consumer>);
};
RatingDetails.propTypes = {
    catalog: PropTypes.object.isRequired,
    formData: PropTypes.object
};


/**
 * Talent Details
 */
export const PendingRatings = (props) => {
    return (<Theme.Consumer>
        {({ bar }) =>
            (<li className="aplication-details">
            </li>)}
    </Theme.Consumer>);
};
PendingRatings.propTypes = {
    catalog: PropTypes.object.isRequired,
    formData: PropTypes.object
};


/**
 * Revire Talent for a specific shift
 */
export const ReviewTalentAndShift = (props) => {
    const shift = props.formData.shift;
    const employee = props.formData.employee;
    const startDate = shift.starting_at.format('ll');
    const startTime = shift.starting_at.format('LT');
    const endTime = shift.ending_at.format('LT');
    return (<Theme.Consumer>
        {({ bar }) =>
            (<li className="aplication-details">
                <h4>How satisfied are you with {employee.user.first_name}{"'"}s performance during this shift?</h4>
                <p className="mb-3">
                    <Avatar url={employee.user.profile.picture} />
                </p>
                <a href="#" className="shift-position">{shift.position.title}</a> @
                <a href="#" className="shift-location"> {shift.venue.title}</a>
                <span className="shift-date"> {startDate} from {startTime} to {endTime} </span>
                {
                    (typeof shift.price == 'string') ?
                        <span className="shift-price"> ${shift.price}</span>
                        :
                        <span className="shift-price"> {shift.price.currencySymbol}{shift.price.amount}</span>
                }
                <StarRating
                    placeholderRating={Number(employee.rating ? employee.rating : 1)}
                    emptySymbol="fa fa-star-o fa-2x"
                    fullSymbol="fa fa-star fa-2x"
                    placeholderSymbol={"fa fa-star fa-2x"}
                />
                <textarea className="form-control mt-3" placeholder={`Please describe further your experiences with ${employee.user.first_name}`}>
                </textarea>
                <div className="btn-bar">
                    <Button color="secondary" onClick={() => bar.close()}>Cancel</Button>
                    <Button color="primary" onClick={() => null}>Send</Button>
                </div>
            </li>)}
    </Theme.Consumer>);
};
ReviewTalentAndShift.propTypes = {
    catalog: PropTypes.object.isRequired,
    formData: PropTypes.object
};


/**
 * Review Talent in general
 */

export const ReviewTalent = ({ onSave, onCancel, onChange, catalog, formData, error, bar }) => {
    const [shifts, setShifts] = useState([]);
    return (<Theme.Consumer>
        {({ bar }) => (
            < form >
                <div className="row">
                    <div className="col-12">
                        <label>Who worked on this shift?</label>
                        <SearchCatalogSelect
                            isMulti={false}
                            value={formData.employee}
                            onChange={(emp) => {
                                onChange({ employee: emp });
                                GET('shifts?unrated=true&employee=' + emp.value)
                                    .then(shifts => setShifts([
                                        { label: `${(shifts.length == 0) ? 'No shifts found' : ''}` }
                                    ].concat(shifts)));
                            }}
                            searchFunction={(search) => new Promise((resolve, reject) =>
                                GET('catalog/employees?full_name=' + search)
                                    .then(talents => resolve([
                                        { label: `${(talents.length == 0) ? 'No one found: ' : ''}Invite "${search}" to jobcore`, value: 'invite_talent_to_jobcore' }
                                    ].concat(talents)))
                                    .catch(error => reject(error))
                            )}
                        />

                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>What shift was it working?</label>
                        <Select
                            value={formData.shift}
                            onChange={(selection) => onChange({ shift: selection.value.toString() })}
                            options={shifts}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>How was his performance during the shift</label>
                        <StarRating
                            fractions={0.5}
                            onHover={() => null}
                            onClick={() => null}
                            direction="right"
                            quiet={true}
                            readonly={false}
                            value={0}
                            totalSymbols={5}
                            placeholderValue={0}
                            fullSymbol="far fa-star fa-xs"
                            emptySymbol="fas fa-star fa-xs"
                            placeholderSymbol="fas fa-star fa-xs"
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>Any comments?</label>
                        <textarea className="form-control"></textarea>
                    </div>
                </div>
                <div className="btn-bar">
                    <Button color="success"
                        onClick={() => onSave({
                            executed_action: '',
                            status: 'OPEN'
                        })}>Send Review</Button>
                </div>
            </form>
        )}
    </Theme.Consumer>
    );
};
ReviewTalent.propTypes = {
    error: PropTypes.string,
    bar: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    formData: PropTypes.object,
    catalog: PropTypes.object //contains the data needed for the form to load
};
ReviewTalent.defaultProps = {
    oldShift: null
};