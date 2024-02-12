
(function () {
    let fields = getUsernameAndPasswordFields();
    const returnFields = {};
    if (fields.userNameField) {
        returnFields.username = fields.userNameField.value
    }
    if (fields.passwordField) {
        returnFields.password = fields.passwordField.value
    }
    return returnFields;
})()