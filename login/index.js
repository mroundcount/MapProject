// https://rhymbil.netlify.app/

// Setting a varial to retreive email for login method
var myEmail;

// Set up our register function
function register () {

  // Get all our input fields
  email = document.getElementById('email').value
  password = document.getElementById('password').value
  username = document.getElementById('username').value

  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false) {
    alert('Email or Password is Outta Line!!')
    return
    // Don't continue running the code
  }
  if (validate_field(username) == false) {
    alert('One or More Extra Fields is Outta Line!!')
    return
  }

  // Move on with Auth
  auth.createUserWithEmailAndPassword(email, password)
  .then(function() {
    // Declare user variable
    var user = auth.currentUser

    // Add this user to Firebase Database
    var database_ref = database.ref()

    // Create User data
    var user_data = {
      email : email,
      username : username,
      user_type : 1,
      created_date : Date.now(),
      last_login : Date.now()
    }

    // Push to Firebase Database
    database_ref.child('users/' + user.uid).set(user_data)

    // Done
    alert('User Created!!')
  })
  .catch(function(error) {
    // Firebase will use this to alert of its errors
    var error_code = error.code
    var error_message = error.message

    alert(error_message)
  })
}


// General login function for field validation before moving on.
function login() {
  console.log("On click");
  // Validate input fields
  if (validate_field(username) == false || validate_password(password) == false) {
    alert('Email or Password is Outta Line!!')
    // Don't continue running the code
    return
  }
  retreiveEmail()
}

// Retreiving user's email address
function retreiveEmail() {
  // https://firebase.google.com/docs/database/admin/retrieve-data#node.js_19
  username = document.getElementById('username').value
  // Pulling email address if they sign in with their username
  const ref = database.ref('users');
  ref.orderByChild('username').equalTo(username).on('child_added', (snapshot) => {
    console.log(snapshot.val().email);
    myEmail = snapshot.val().email
    console.log("My Email from uername is: " + myEmail);
    loginEmail()
  });
  // If the above check returns null then we will pull the email address and move it though the traditional function
  ref.orderByChild('email').equalTo(username).on('child_added', (snapshot) => {
    console.log(snapshot.val().email);
    myEmail = snapshot.val().email
    console.log("My Email from uername is: " + myEmail);
    loginEmail()
  });
}

// This is the traditional function that passes in the given email address
// Set up our login function
function loginEmail() {
  console.log("In the login with email function");
  // Get all our input fields
  email = myEmail
  password = document.getElementById('password').value

  auth.signInWithEmailAndPassword(email, password)
  .then(function() {
    // Declare user variable
    var user = auth.currentUser

    // Add this user to Firebase Database
    var database_ref = database.ref()

    // Create User data
    var user_data = {
      last_login : Date.now()
    }

    // Push to Firebase Database
    database_ref.child('users/' + user.uid).update(user_data)

    // Done
    alert('User Logged In!!')
    //Navigating to myMaps page
    window.location.href = "DEV/Maps/index.html";


  })
  .catch(function(error) {
    // Firebase will use this to alert of its errors
    var error_code = error.code
    var error_message = error.message

    alert(error_message)
  })
}


function resetPassword() {
  email = document.getElementById('email').value

  if (validate_email(email) == false) {
    alert('Please end a valid email address')
    return
  }

  // Reset function
  // https://stackoverflow.com/questions/70642016/firebase-sendpasswordresetemail-not-working-in-react
  auth.sendPasswordResetEmail(email)
    .then(function() {
      alert('Email will be sent to ' + email)
      window.location = 'index.html'
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
  });
}


function logout() {
  // https://stackoverflow.com/questions/37343309/best-way-to-implement-logout-in-firebase-v3-0-1-firebase-unauth-is-removed-aft
  firebase.auth().signOut()
  .then(function() {
    // Sign-out successful.
      alert('Signing out!')
      window.location = 'index.html'
  })
  .catch(function(error) {
    // An error happened
  });
}


function deleteAccount() {
  user = firebase.auth().currentUser;
  var uid = user.uid;

  // Deletes the user from auth
  // https://firebase.google.com/docs/auth/admin/manage-users#delete_a_user
  user.delete()
  .then(function() {
    // Deleting user from real time database
    database.ref('users/'+uid).remove();
    alert('Account Deleted!')
    window.location = 'index.html'
  })
  .catch(function(error) {
    alert('Firebase requires you to have logged in within five minutes of deleting your account. If you want to delete your account logout, log in, and try again.')
    const errorCode = error.code;
    const errorMessage = error.message;
  })
  // This deletes the user from the authentication, but not the record in the real time database.
  // NOTE: you need to be logged in within five minutes or firebase will not delete.
  //firebase.auth().currentUser.delete()
};

// Validate Functions
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/
  if (expression.test(email) == true) {
    // Email is good
    return true
  } else {
    // Email is not good
    return false
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 6
  if (password < 6) {
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  if (field == null) {
    return false
  }
  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}

function validate_username(field) {
  myUsername = document.getElementById('username').value
  const ref = database.ref('users');
  ref.orderByChild('username').equalTo(myUsername).on('child_added', (snapshot) => {
    console.log(snapshot.val().username);
  });
}


// Checking if a user is signed in
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    var user = firebase.auth().currentUser;
    var uid, email;
    if(user != null){
      var uid = user.uid;
      var email = user.email;

      console.log(" Success ");
      console.log(" UserID: " + uid);

      //https://firebase.google.com/docs/database/web/read-and-write
      //Read data once
      return firebase.database().ref('/users/' + uid).once('value').then((snapshot) => {
        var username = (snapshot.val() && snapshot.val().username);
        console.log(" email: " + email);
        console.log(" username: " + username);
        //document.getElementById("user_para").innerHTML = "Welcome to the Hooked Uploader : " + "<br />" + username;
      });

    }

  } else {
    // No user is signed in.
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }
});
