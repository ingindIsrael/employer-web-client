import React from "react";
import PropTypes from 'prop-types';
import './style.scss'; 
import Avatar from '../avatar';
import Stars from '../stars';
import Theme from '../theme';
import AcceptReject from '../accept-reject';

/**
 * 
 * @summary Creates an object for each employee with their information.
 * @description It's automatically triggered by navigating to the "Applicants" page, and it loops through each listed employee.
 * @since 08.30.22 by Paola Sanchez
 * @author Alejandro Sanchez
 * @see Theme from "../theme"
 * @param {Object} props - Information object about one of the listed employees.
 * @param {Object} props.postitions - List of all existing/available job positions
 * @param {Object} props.employee - Basic information on the employee
 * @returns A card that shows key facts about each looped employee.
 */

const ApplicantCard = (props) => {
    const applicant = props.applicant.employee || props.applicant;
    return (<Theme.Consumer>
        {({bar}) => 
            (<li className="aplicantcard"
                onClick={() => bar.show({ slug: "show_single_applicant", data: props.applicant, title: "Application Details", allowLevels: true })}>
                <Avatar url={applicant.user.profile.picture} />
                <AcceptReject
                    onAccept={() => props.onAccept(props.shift.id, applicant)} 
                    onReject={() => props.onReject(props.shift.id, applicant)} 
                />
                <a href="#" className="shift-position">{applicant.user.first_name + " " + applicant.user.last_name}</a>
                <Stars rating={Number(applicant.rating)}  />
            </li>)}
    </Theme.Consumer>);
};
ApplicantCard.propTypes = {
  applicant: PropTypes.object.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  shift: PropTypes.object.isRequired
};

export default ApplicantCard;


/*

export const ApplicantCard = (props) => {
    return (<Theme.Consumer>
        {({bar}) => 
            (<li className="aplicantcard"
                 onClick={() => bar.show({ slug: "show_single_applicant", data: props.applicant, title: "Application Details", allowLevels: true })}
            >
                <Avatar url={props.applicant.user.profile.picture} />
                <AcceptReject
                    onAccept={() => acceptCandidate(props.shift.id, props.applicant).then(() => props.onAccept ? props.onAccept() : null)} 
                    onReject={() => rejectCandidate(props.shift.id, props.applicant).then(() => props.onReject ? props.onReject() : null)} 
                />
                <a href="#" className="shift-position">{props.applicant.user.first_name + " " + props.applicant.user.last_name}</a>
                <Stars rating={Number(props.applicant.rating)}  />
            </li>)}
    </Theme.Consumer>);
};
ApplicantCard.propTypes = {
  applicant: PropTypes.object.isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  shift: PropTypes.object.isRequired
};
ApplicantCard.defaultProps = {
  onAccept: null,
  onReject: null
};

*/