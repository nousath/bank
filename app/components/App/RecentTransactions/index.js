/**
 *
 * RecentTransactions
 *
 */

import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import saga from 'containers/DashboardPage/saga';
import reducer from 'containers/DashboardPage/reducer';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { format } from 'date-fns';
import { FormattedMessage } from 'react-intl';
import { makeUserIdSelector } from 'containers/App/selectors';
import {
  makeRecentTransactionsRecipientSelector,
  makeRecentTransactionsSenderSelector,
} from 'containers/DashboardPage/selectors';
import {
  getRecentTransactionsRecipientAction,
  getRecentTransactionsSenderAction,
} from 'containers/DashboardPage/actions';
import SoftWidgetHeader from 'components/App/SoftWidget/SoftWidgetHeader';
import SoftWidgetWrapper from 'components/App/SoftWidget/SoftWidgetWrapper';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import LoadingWrapper from 'components/App/LoadingWrapper';
import TableBodyWrapper from 'components/App/Table/TableBodyWrapper';
import TableCellWrapper from './TableCellWrapper';
import messages from './messages';
import LoadingCircular from '../LoadingCircular';
import RecentTransitionsSenderAmountWrapper from './RecentTransitionsSenderAmountWrapper';
import RecentTransitionsRecipientNameWrapper from './RecentTransitionsRecipientNameWrapper';

function RecentTransactions({
  recentTransactionsRecipient,
  recentTransactionsSender,
  userId,
  getRecentTransactionsRecipient,
  getRecentTransactionsSender,
  sortingData,
}) {
  useInjectSaga({ key: 'dashboardPage', saga });
  useInjectReducer({ key: 'dashboardPage', reducer });
  useEffect(() => {
    getRecentTransactionsRecipient();
    getRecentTransactionsSender();
  }, []);

  let index = 0;

  return (
    <SoftWidgetWrapper noShadow>
      <SoftWidgetHeader noBackground>
        <FormattedMessage {...messages.recentTransactions} />
      </SoftWidgetHeader>

      {recentTransactionsRecipient && recentTransactionsSender ? (
        <Table>
          <TableBodyWrapper>
            {sortingData([
              ...recentTransactionsRecipient,
              ...recentTransactionsSender,
            ]).map(row => (
              <TableRow key={index++}>
                {row.id_sender === userId ? (
                  <Fragment>
                    <TableCellWrapper recent="true">
                      <RecentTransitionsRecipientNameWrapper>
                        <FormattedMessage {...messages.toPayment} />{' '}
                        <span>
                          {row.getRecipientdata.name}{' '}
                          {row.getRecipientdata.surname}
                        </span>
                      </RecentTransitionsRecipientNameWrapper>
                      <div>{row.transfer_title}</div>
                    </TableCellWrapper>
                    <TableCellWrapper>
                      <div>{format(row.date_time, `DD.MM.YYYY`)}</div>
                      <RecentTransitionsSenderAmountWrapper>
                        {row.amount_money} {row.currency.currency}
                      </RecentTransitionsSenderAmountWrapper>
                    </TableCellWrapper>
                  </Fragment>
                ) : (
                  <Fragment>
                    <TableCellWrapper>
                      <div>
                        <FormattedMessage {...messages.fromPayment} />
                        {row.getSenderdata.name} {row.getSenderdata.surname}
                      </div>
                      <div>{row.transfer_title}</div>
                    </TableCellWrapper>
                    <TableCellWrapper>
                      <div>{format(row.date_time, `DD.MM.YYYY`)}</div>
                      <div>
                        {row.amount_money} {row.currency.currency}
                      </div>
                    </TableCellWrapper>
                  </Fragment>
                )}
              </TableRow>
            ))}
          </TableBodyWrapper>
        </Table>
      ) : (
        <LoadingWrapper>
          <LoadingCircular />
        </LoadingWrapper>
      )}
    </SoftWidgetWrapper>
  );
}

RecentTransactions.propTypes = {
  getRecentTransactionsRecipient: PropTypes.func,
  getRecentTransactionsSender: PropTypes.func,
  sortingData: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  recentTransactionsRecipient: makeRecentTransactionsRecipientSelector(),
  recentTransactionsSender: makeRecentTransactionsSenderSelector(),
  userId: makeUserIdSelector(),
});

function mapDispatchToProps(dispatch) {
  return {
    getRecentTransactionsRecipient: () =>
      dispatch(getRecentTransactionsRecipientAction()),
    getRecentTransactionsSender: () =>
      dispatch(getRecentTransactionsSenderAction()),
    sortingData: data =>
      data
        .sort((a, b) => Date.parse(b.date_time) - Date.parse(a.date_time))
        .slice(0, 4),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(RecentTransactions);
