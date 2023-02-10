const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

module.exports = app => {

    //rota de cadastro de parceiro
    app.post('/signuppartner', app.api.parceiro.save);
    //rota de login de parceiro
    app.post('/signin', app.api.auth.signin);

    //rota de cadastro de usuario
    app.post('/signupUser', app.api.user.createUser);

    //rota de login de usuario
    app.post('/signinUser', app.api.auth.signinUser);

    app.post('/forgotPasswordParceiro', app.api.auth.forgotPasswordParceiro);

    app.post('/codeParceiro', app.api.auth.codeParceiro);

    app.post('/resetPasswordParceiro/:passwordKey', app.api.auth.resetPasswordParceiro);

    app.post('/forgotPasswordUser', app.api.auth.forgotPasswordUser);

    app.post('/codeUser', app.api.auth.codeUser);

    app.post('/resetPasswordUser/:passwordKey', app.api.auth.resetPasswordUser);

    app.get('/allBar', app.api.parceiro.getAllPathner);

    app.get('/filterBar', app.api.parceiro.getFilterPartner);

    app.get('/getBar', app.api.parceiro.getPartner);

    app.get('/getDrink', app.api.parceiro.getDrink);

    app.post('/daysBar', app.api.parceiro.daysBar);

    app.get('/getDaysBar', app.api.parceiro.getDaysBar);

    app.get('/getDaysBar/:id', app.api.user.getDaysBar);

    app.route('/partner')
    .all(app.config.passport.authenticate())
    .get(app.api.parceiro.getPartnerById)

    app.route('/editPartner')
    .all(app.config.passport.authenticate())
    .post(app.api.parceiro.editPathner)

    app.route('/createDrink')
    .all(app.config.passport.authenticate())
    .post(app.api.drink.imageTeste);

    app.route('/teste')
    .all(app.config.passport.authenticate())
    .get(app.api.drink.selectDrinkByParther)
    app.get('/allDrink',app.api.drink.getAllDrink);

    // app.route('/partner')
    //     .post(app.api.parceiro.getPartnerById)

    app.route('/drinkSave')
    .all(app.config.passport.authenticate())
    .post(app.api.drink.createDrink)

    app.route('/contact')
    .all(app.config.passport.authenticate())
    .post(app.api.contact.saveMensagem)

    //rota de cadastro de user
    app.post('/createUser', app.api.user.createUser)

    app.route('/historyDrink')
    .all(app.config.passport.authenticate())
    .get(app.api.drink.historyDrink)

    app.route('/historyDrinkUser')
    .get(app.api.drink.historyDrinkUser)

    app.route('/validateDrink')
    .post(app.api.drink.validateDrink)

    app.route('/drinkMostRequest')
    .all(app.config.passport.authenticate())
    .get(app.api.drink.mostRequestDrink)

    app.post('/paymentWebhook',express.raw({ type: 'application/json' }),app.api.stripe.paymentWebhook)
    app.post('/cancelSubscription',app.api.stripe.cancelSubscription)
    app.get('/users/:user_id', app.api.user.getAllUserInfo);
    
    //apagar usuário 
    app.route('/deleteUser')
    //.all(app.config.passport.authenticate())
    .post(app.api.user.deleteUser);

    //apagar parceiro
    app.route('/deletePartner')
    .all(app.config.passport.authenticate())
    .post(app.api.parceiro.deletePartner);

    app.post('/setFav',app.api.user.setFav)
    app.delete('/delFav',app.api.user.delFav)
    app.get('/allFavs/:user_id',app.api.user.allFavs)
    
    app.get('/testCoords',app.api.parceiro.testCoords)
    
    app.route('/toggleDrink')
        .all(app.config.passport.authenticate())
        .put(app.api.drink.toggleDrink)
}
