import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import FoldingTable from './FoldingTable';
import ShareProgramRecordModal from './ShareProgramRecordModal';
import StringUtils from './Utils';

class ProgramRecord extends React.Component {
  constructor(props) {
    super(props);

    this.loadShareModel = this.loadShareModel.bind(this);
    this.closeShareModel = this.closeShareModel.bind(this);
    this.setShareButton = this.setShareButton.bind(this);

    this.state = {
      shareModelOpen: false,
    };
  }

  setShareButton(button) {
    this.shareButton = button;
  }

  loadShareModel() {
    this.setState({
      shareModelOpen: true,
    });
  }

  closeShareModel() {
    this.setState({
      shareModelOpen: false,
    });
    this.shareButton.focus();
  }

  renderLearnerInfo() {
    const { learner, platform_name } = this.props;

    return (
      <section id="learner-info" className="learner-info">
        <FoldingTable
          columns={[
            { key: 'full_name', label: gettext('Name') },
            { key: 'username', label: StringUtils.interpolate(gettext('{platform} User ID'), { platform: platform_name }),
            },
            { key: 'email', label: gettext('Email') },
          ]}
          foldedColumns={[
            { key: 'full_name', className: 'hd-5 emphasized', format: gettext('Name: {}') },
            { key: 'username', className: 'hd-5 emphasized', format: StringUtils.interpolate(gettext('{platform} User ID: {}'), { platform: platform_name }) },
            { key: 'email', className: 'hd-5 emphasized', format: gettext('Email: {}') },
          ]}
          // Convert the data to an array despite being a single
          // object to use the FoldingTable styles
          data={[learner]}
          dataKey="username"
        />
      </section>
    );
  }

  render() {
    const { shareModelOpen } = this.state;
    const { learner, program, platform_name, grades, uuid } = this.props;
    const recordWrapperClass = 'program-record';

    return (
      <main className={recordWrapperClass}>
        {learner &&
          <section id="program-record-actions" className={['program-record-row']}>
            <a href="/records/" className="top-bar-link flex-4">
              <span className="fa fa-caret-left" aria-hidden="true" /> {gettext('Back to My Records')}
            </a>
            <Button
              label={gettext('Share')}
              className={['btn-primary', 'flex-1']}
              onClick={this.loadShareModel}
              inputRef={this.setShareButton}
            />
          </section>
        }
        {program &&
          <section id="program-record-title-bar" className="program-record-row">
            <div name="program-name" className="hd-3 flex-1">
              { StringUtils.interpolate(gettext('{program_name} Record'), { program_name: program.name }) }
            </div>
            <div name="school-name" className="hd-3">
              { StringUtils.interpolate(gettext('{platform} | {school}'), { platform: platform_name, school: program.school }) }
            </div>
          </section>
        }
        {learner && this.renderLearnerInfo()}
        {grades &&
          <section id="program-record">
            <FoldingTable
              columns={[
                { key: 'name', label: gettext('Course Name') },
                { key: 'school', label: gettext('School') },
                { key: 'attempts', label: gettext('Verified Attempts') },
                { key: 'course_id', label: gettext('Course ID') },
                { key: 'issue_date', label: gettext('Issue Date') },
                { key: 'percent_grade', label: gettext('Highest Grade Earned') },
                { key: 'letter_grade', label: gettext('Letter Grade') },
              ]}
              foldedColumns={[
                { key: 'name', className: 'hd-5 emphasized' },
                { key: 'school' },
                { key: 'attempts', format: gettext('Verified Attempts: {}') },
                { key: 'course_id', format: gettext('Course ID: {}') },
                { key: 'start', format: gettext('Start Date: {}') },
                { key: 'end', format: gettext('End Date: {}') },
                { key: 'percent_grade', format: gettext('Percent Grade: {}') },
                { key: 'letter_grade', format: gettext('Letter Grade: {}') },
              ]}
              data={grades}
              dataKey="name"
            />
            <hr />
          </section>
        }
        {shareModelOpen &&
          <ShareProgramRecordModal
            onClose={this.closeShareModel}
            parentSelector={`.${recordWrapperClass}`}
            username={learner.username}
            uuid={uuid}
          />
        }
      </main>
    );
  }
}

ProgramRecord.propTypes = {
  learner: PropTypes.shape({}).isRequired,
  program: PropTypes.shape({
    name: PropTypes.string,
    school: PropTypes.string,
  }).isRequired,
  grades: PropTypes.arrayOf(PropTypes.object).isRequired,
  uuid: PropTypes.string.isRequired,
  platform_name: PropTypes.string.isRequired,
};

export default ProgramRecord;