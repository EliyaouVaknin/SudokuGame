const c_Admin = {
	userName: "abcd",
	password: "1234"
};

const c_UserList = [ c_Admin ];

function checkUserLogin() {
	let loginUserName = document.getElementById("textbox-login-user").value;
	let loginPassword = document.getElementById("textbox-login-password").value;
	let checkValidationCounter = 0;

	let userNameHeading;
	for (let i = 0; i < c_UserList.length; i++) {
		if (c_UserList[i].userName == loginUserName && c_UserList[i].password == loginPassword) {
			userNameHeading = c_UserList[i].userName;
			checkValidationCounter++;
		}
	}
	if (checkValidationCounter > 0) {
		document.getElementById("username-heading").innerHTML = userNameHeading;
		showScreen("difficultyScreen");
	} else {
		showLoginErrorMessage("Incorrect username or password")
	}
}

function registerNewUser() {
	let userExists = 0;
	let newUserName = document.getElementById("textbox-register-user").value;
	let newUserPassword = document.getElementById("textbox-register-password").value;

	if (newUserPassword.length >= 3 && newUserName.length >= 3) {
		for (let i = 0; i < c_UserList.length; i++) {
			if (newUserName == c_UserList[i].userName) { userExists++; }
		}
		if (userExists > 0) {
			showRegistrationErrorMessage("Username already exists")
		} else {
			let newUser = {
				userName: newUserName,
				password: newUserPassword
			};
			c_UserList.push(newUser);
			showScreen("loginScreen");
		}
	} else {
		showRegistrationErrorMessage("Username or password is too short");
	}
}