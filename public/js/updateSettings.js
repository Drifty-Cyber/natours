/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Updated ${type.toUpperCase()} successfully!`);

      location.reload(true);

      return res.status(200).render('account', {
        title: 'Your Account',
      });
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
