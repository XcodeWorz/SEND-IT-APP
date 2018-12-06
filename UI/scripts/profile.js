const profileHead = document.getElementById('head');
const profileBody = document.getElementById('body');
const token = localStorage.getItem('token');
const modal = document.querySelector('.modal');

let highlighted = profileHead.querySelector('ul').firstElementChild;

profileHead.addEventListener('click', (e) => {
  if (e.target.tagName !== 'LI') return;
  display(e.target);
});

function display(node) {
  if (highlighted) {
    highlighted.classList.remove('highlight');
    for (elem of profileBody.children) {
      if (highlighted.id === elem.id) elem.style.display = 'none';
    }
  }
  highlighted = node;
  highlighted.classList.add('highlight');
  for (elem of profileBody.children) {
    if (highlighted.id === elem.id) elem.style.display = '';
  }
}


document.addEventListener('DOMContentLoaded', async (e) => {
  const userInfo = document.querySelector('.info');

  const response = await fetch('/api/v1/user/', {
    headers: {
      'x-auth-token': token
    },
  });

  if (response.status === 404) return window.location.href = '../signup.html';

  const body = await response.json();

  userInfo.innerHTML = `<ul>
  <li id="username"><h2>${body.fullname.toUpperCase()}</h2></li>
  <li><b>Email: </b>${body.email}</li>
  <li id="user-cont"><b>Phone No:</b> <span id= 'contact-edit'><span id='num-edit'>${body.phoneno}</span>  <button id="num-change">Change?</button></span></li>
  <li id="reg-date"><b>Date Registered: </b>${new Date(Date.parse(body.registered))} </li>
  <li><b>Total Number of Parcel Orders:</b> <span id="total-parcels"></span></li>
</ul>`;

  const numEdit = document.getElementById('num-edit');
  const numChange = document.getElementById('num-change');
  const contactEdit = document.getElementById('contact-edit');


  numChange.onclick = (e) => {
    const numForm = document.createElement('form');
    numForm.style.display = 'inline';
    numForm.innerHTML = '<input type="number" name = "contact" style="max-width: 150px; padding: 3px; display: inline;"> <input type= "submit" value ="submit" style="display:inline; padding: 3px; width: auto;">';
    numForm.contact.value = numEdit.innerHTML;
    contactEdit.replaceWith(numForm);

    numForm.onsubmit = (e) => {
      e.preventDefault();
      const value = numForm.contact.value;
      numForm.replaceWith(contactEdit);
      numEdit.innerHTML = value;
    };
  };

  const result = await fetch('/api/v1/user/parcels', {
    headers: {
      'x-auth-token': token,
    },
  });

  const unfulfilled = document.querySelector('.unfulfilled');
  const delivered = document.querySelector('.delivered');
  const totalParcels = document.getElementById('total-parcels');

  if (result.status === 404) {
    setTimeout(() => { totalParcels.innerHTML = '0'; }, 0);

    unfulfilled.innerHTML = `<ul style="width: 100%; text-align: center; background: white;">
    <li><h2>You have no Unfulfilled orders<h2></li>
    <li><a href="/bookings.html" style="text-decoration:underline;">Create An Order Now</a></li>
    </ul>`;

    delivered.innerHTML = `<ul style="width: 100%; text-align: center; background: white;">
    <li><h2>You have no delivered orders<h2></li>
    </ul>`;

    return;
  }

  if (result.status !== 200) return;

  const parcelsBody = await result.json();
  setTimeout(() => { totalParcels.innerHTML = parcelsBody.length; }, 0);
  const unfulfilledParcels = parcelsBody.filter(a => a.status !== 'delivered');
  const deliveredParcels = parcelsBody.filter(a => a.status === 'delivered');

  if (!unfulfilledParcels[0]) {
    unfulfilled.innerHTML = `<ul style="width: 100%; text-align: center; background: white;">
  <li><h2>You have no Unfulfilled orders<h2></li>
  <li><a href="/bookings.html" style="text-decoration:underline;">Create An Order Now</a></li>
  </ul>`;
  }

  if (!deliveredParcels[0]) {
    delivered.innerHTML = `<ul style="width: 100%; text-align: center; background: white;">
  <li><h2>You have no delivered orders<h2></li>
  </ul>`;
  }

  unfulfilledParcels.forEach((item) => {
    if (item.status === 'recorded') {
      unfulfilled.insertAdjacentHTML('afterbegin', `<ul>
      <li><b>Parcel ID:</b> <span id="parcelId"> ${item.parcelid}</span></li>
      <li><b>Parcel Description:</b> <span id="parcelDesc"> ${item.parceldescription}</span ></li>
      <li id="red-date"><b>Parcel Weight:</b> ${item.parcelweight}</li>
      <li id="red-date"><b>Price:</b> N${item.price}</li>
      <li id= "total-parcels"><b>Pickup Location:</b> ${item.pickupaddress}</li>
      <li id="red-date"><b>Destination:</b> ${item.destination}</li>
      <li id="red-date"><b>Pickup Time:</b> ${new Date(item.pickuptime)}</li>
      <li id="red-date"><b>Status:</b> ${item.status}</li>
      <li><button onclick= "cancelOrder(${item.parcelid})">Cancel</button> <button onclick="changeDestination(${item.parcelid})">Change Destination</button></li>
  </ul>`);
    }

    if (item.status === 'cancelled') {
      unfulfilled.insertAdjacentHTML('beforeend', `<ul>
      <li><b>Parcel ID:</b> <span id="parcelId"> ${item.parcelid}</span></li>
      <li><b>Parcel Description:</b> <span id="parcelDesc"> ${item.parceldescription}</span ></li>
      <li id="red-date"><b>Parcel Weight:</b> ${item.parcelweight}</li>
      <li id="red-date"><b>Price:</b> N${item.price}</li>
      <li id= "total-parcels"><b>Pickup Location:</b> ${item.pickupaddress}</li>
      <li id="red-date"><b>Destination:</b> ${item.destination}</li>
      <li id="red-date"><b>Pickup Time:</b> ${new Date(item.pickuptime)}</li>
      <li id="red-date"><b>Status:</b> ${item.status}</li>
  </ul>`);
    }

    if (item.status === 'in transit') {
      unfulfilled.insertAdjacentHTML('beforeend', `<ul>
      <li><b>Parcel ID:</b> <span id="parcelId"> ${item.parcelid}</span></li>
      <li><b>Parcel Description:</b> <span id="parcelDesc"> ${item.parceldescription}</span ></li>
      <li><b>Parcel Weight:</b> ${item.parcelweight}</li>
      <li><b>Price:</b> ${item.price}</li>
      <li><b>Pickup Location:</b> ${item.pickupaddress}</li>
      <li><b>Destination:</b> ${item.destination}</li>
      <li><b>Status:</b> ${item.status}</li>
      <li><b>Present Location:</b> ${item.presentlocation}</li>
      <li><button>Cancel</button> <button>Change Destination</button> <button>Track</button></li>
  </ul>`);
    }
  });

  deliveredParcels.forEach((item) => {
    delivered.insertAdjacentHTML('afterbegin', `<ul>
      <li><b>Parcel ID:</b> <span id="parcelId"> ${item.parcelid}</span></li>
      <li><b>Parcel Description:</b> <span id="parcelDesc"> ${item.parceldescription}</span ></li>
      <li><b>Parcel Weight:</b> ${item.parcelweight}</li>
      <li><b>Price Paid:</b> ${item.price}</li>
      <li><b>Status:</b> ${item.status}</li>
      <li><b>Picked Up At:</b> ${item.pickupaddress}</li>
      <li><b>Dropped At:</b> ${item.destination}</li>
      <li><b>Received By:</b> ${item.receivedby}</li>
      <li><b>Time Received:</b> ${item.receivedat}</li>
  </ul>`);
  });
});

function cancelOrder(id) {
  modal.style.display = 'block';

  const confirmOrder = document.getElementById('confirm-order');
  confirmOrder.innerHTML = `<div style="text-align: center; margin: 25% auto;">
  <h2>Are you sure you want to cancel this order?</h2>
  <button id="abort">No! Return</button><button id="confirm-cancel">Yes! Cancel</button>
  </div>`;

  const abort = document.getElementById('abort');
  const confirmCancel = document.getElementById('confirm-cancel');

  abort.onclick = () => {
    modal.style.display = '';
  };

  confirmCancel.onclick = async () => {
    const response = await fetch(`/api/v1/parcels/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token,
      },
    });

    const body = await response.json();

    if (response.status !== 200) {
      confirmOrder.innerHTML = `<div style="text-align: center; margin: 25% auto;">
      <h4>Couldn't cancel order presently. ${body.message}</h4>
      <button id="abort">Return</button>
      </div>`;
      return;
    }

    confirmOrder.innerHTML = '<h1 style="color: green; text-align: center; margin: 25% auto;">Order successfully cancelled</h1>';
    location.href = '/profile.html';
  };
}

function changeDestination(id) {
  modal.style.display = 'block';

  const confirmOrder = document.getElementById('confirm-order');
  confirmOrder.innerHTML = `<form id="update-form" style="margin: 20% auto;">
  <label><h3>New Destination</h3></label>
  <small></small>
  <input style="margin-bottom:0;" type="text" name="destination" placeholder="New Destination">
  <button id="abort" type="button">Return</button> <button type="submit">Submit</button>
  </form>`;

  const abort = document.getElementById('abort');
  const updateForm = document.getElementById('update-form');

  abort.onclick = () => {
    modal.style.display = '';
  };

  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!updateForm.destination.value) {
      updateForm.destination.previousElementSibling.innerHTML = 'This must not be empty';
      return;
    }
    const json = JSON.stringify({
      destination: updateForm.destination.value,
    });

    const response = await destinationRequest(`/api/v1/parcels/${id}/confirmUpdate`, json)
    const body = await response.json();

    if (response.status === 400) {
      updateForm.destination.previousElementSibling.innerHTML = body.message;
      return;
    }

    if (response.status !== 200) {
      confirmOrder.innerHTML = `<h3 style="color: red; text-align: center; margin: 25% auto;">${body.message}</h3>`;
      return;
    }

    confirmOrder.innerHTML = `<ul style="margin: 20% auto">
    <h2 style = "text-align: center;">Confirm Update</h2>
    <li><b>New destination:</b> ${body.destination}</li>
    <li><b>New price:</b> N${body.price}</li>
    <li><button id= "cancel">Cancel</button> <button id = "confirm">Confirm</button></li>
    </ul>`;

    const cancelUpdate = document.getElementById('cancel');
    const confirmUpdate = document.getElementById('confirm');

    cancelUpdate.onclick = () => {
      modal.style.display = '';
    };

    confirmUpdate.onclick = async () => {
      const result = await destinationRequest(`/api/v1/parcels/${id}/destination`, json);
      const resultBody = await result.json();
      if (result.status !== 200) {
        confirmOrder.innerHTML = `<h3 style="color: red; text-align: center; margin: 25% auto;">${resultBody.message}</h3>`;
        return;
      }
      confirmOrder.innerHTML = '<h2 style="color: green; text-align: center; margin: 25% auto;">Destination successfully changed</h2s>';
      window.location.href = '/profile.html';
    };
  });
}


async function destinationRequest(url, json) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: json,
  });

  return response;
}
