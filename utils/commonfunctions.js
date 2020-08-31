const brcypt = require('bcryptjs');
const asyncHandler = require('../middleware/async');

exports.getUserTableKeys = asyncHandler(async (userReq) => {
    let keys = [];

    for (let i = 0; i < Object.keys(userReq).length; i++) {
        let userKey = Object.keys(userReq)[i];

        if (process.env.USER_TABLE_COLUMNS.split(',').includes(userKey)) {
            keys.push(userKey);
        }

    }

    return keys;
})

exports.createUserTableQuery = asyncHandler(async (userKey, userReq, id) => {
    let updateQuery = "update user set ";
    const salt = await brcypt.genSalt(10);
    let encrypted_password = '';

    if (Object.keys(userReq).includes('password')) {
        encrypted_password = await brcypt.hash(userReq.password, salt);
    }

    for (let i = 0; i < userKey.length; i++) {
        let key = userKey[i];

        //If value not blank then insert into query
        if (userReq[key] != '') {
            updateQuery += `${key} = '${key == 'password' ? encrypted_password : userReq[key]}', `;
        } else if (['reset_password_token', 'reset_password_expire'].includes(key)) {
            updateQuery += `${key} = '', `
        }

    }

    updateQuery += `updated_date = now() where user_id = ${id}`;

    return updateQuery;

})

exports.getCustomerTableKeys = asyncHandler(async (custReq) => {
    let keys = [];

    for (let i = 0; i < Object.keys(custReq).length; i++) {
        let custKey = Object.keys(custReq)[i];

        if (process.env.CUSTOMER_TABLE_COLUMNS.split(',').includes(custKey)) {
            keys.push(custKey);
        }
    }

    return keys;
})

exports.createCustomerTableQuery = asyncHandler(async (custKey, custReq, id) => {
    let updateQuery = "update customer_master set ";

    for (let i = 0; i < custKey.length; i++) {
        let key = custKey[i];

        //If value not blank then insert into query
        if (custReq[key] != '') {
            updateQuery += `${key} = '${custReq[key]}', `;
        }

    }

    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` where customer_id = '${id}'`;

    return updateQuery;

})

exports.getTechnicianTableKeys = asyncHandler(async (techReq) => {
    let keys = [];

    for (let i = 0; i < Object.keys(techReq).length; i++) {
        let techKey = Object.keys(techReq)[i];

        if (process.env.TECHNICIAN_TABLE_COLUMNS.split(',').includes(techKey)) {
            keys.push(techKey);
        }
    }

    return keys;
})

exports.createTechnicianTableQuery = asyncHandler(async (techKey, techReq, id) => {
    let updateQuery = "update technician_master set ";

    for (let i = 0; i < techKey.length; i++) {
        let key = techKey[i];

        //If value not blank then insert into query
        if (techReq[key] != '') {
            updateQuery += `${key} = '${techReq[key]}', `;
        }

    }

    updateQuery += `updatedDate = now() where tech_id = '${id}'`;

    return updateQuery;

})

exports.createTicketReference = asyncHandler(async (ticket_no) => {
    let d = new Date();
    var mm = d.getMonth() + 1; // getMonth() is zero-based
    var dd = d.getDate();

    //Returns output in format yyyymmdd
    return [d.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('') + ticket_no;
})

exports.generateRefNo = asyncHandler(async (num) => {

    if (num.length <= 4) {
        return num.length == 4 ? num : (num.length == 3 ? '0' + num : (num.length == 2 ? '00' + num : '000' + num))
    } else {
        return '0000'
    }

})