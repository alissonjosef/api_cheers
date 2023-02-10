const bcrypt = require('bcrypt-nodejs')
const { authSecret } = require('../.env')
// const jwt_decode = require("jwt-decode")

module.exports = app => {
    const obterHash = (password, callback) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, null, (err, hash) => callback(hash))
        })
    }

    const createUser  = async (req, res) => {
        const { name, email, age , password } = req.body

        if(!name || !email || !age || !password)
            return res.status(400).json({
                errormsg: "Empty Fields",
                body:req.body
            })

        const hasUser = await app.db('users').select('*').where({email})
        if(hasUser.length > 0)
            return res.status(303).json({
                status:"Email in use"
            })
        obterHash(req.body.password, hash => {
            const passwordHash = hash

            app.db('users')
            .insert({ 
                name,
                age,
                password:passwordHash,
                email,
            })
            .then(_ => res.status(201).json({
                status:"OK"
            }))
            .catch(err => {
                res.status(400).json(err)
            })
        })
    }


    const getAllUser = (req, res) => {
        app.db('users')
        .select(
            '*'
        ).then(user => res.json(user))
        .catch(err => res.status(401).json(err))
    }

    const getDrinkByUser = (req, res) => {
        app.db('users')
        .select(
            '*'
        ).where({id:req.id})
        .then(user => res.json(user))
        .catch(err => res.status(401).json(err))
    }

    const updateUser  = (req, res) => {

        app.db('users')
        .where({ id: req.body.id})
        .update(req.body)
        .then(_ => res.status(200).send({sucsses:true}))
        .catch(err => res.status(400).json(err))

    }

    function getToken(req) {
        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "Bearer"
        ) {
            return req.headers.authorization.split(" ")[1];
        }
        return null;
    }


    const getDaysBar = (req, res) => {

            const { id } = req.params;

        app.db('bar_day')
            .select('*')
            .where({ parceiroId: id })
            .first()
            .then(partner => {
                return res.json(partner)
            })
            .catch(err => res.status(400).json(err))
    }


    const deleteUser = (req,res) => {

        const { id } = jwt_decode(getToken(req));
        
        // const { user_id } = req.body

        if(user_id != undefined) {
            app.db('users')
                .where({ id: user_id})
                .del()
                .then(rowsDeleted => {
                    if (rowsDeleted > 0) {
                        res.status(204).send()
                    } else {
                        const msg = `user não encontrado ${user_id}.`
                        res.status(400).send(msg)
                    }
                })
                .catch(err => res.status(400).json(err))
        } else {
            res.status(400).send("Usúario não autorizado!")
        }

    }


    async function getAllUserInfo(req,res){
        const { user_id } = req.params
        if(!user_id)
            return res.status(401).json({
                success: false,
                errorMsg: 'user_id is empty'
            })

        const tempInfo = await userInfo(user_id)

        if(!tempInfo?.success)
            return res.status(tempInfo.status).json({
                success: false,
                errorMsg: tempInfo.errorMsg
            })
        return res.status(200).json(tempInfo)
    }

    function userInfo(user_id){
        return app.db('users')
            .select('users.id as uid',"users.*","subscriptions.*")
            .where({'users.id': user_id})
            .leftJoin('subscriptions','users.id','subscriptions.user_id')
            .orderBy('updated_at','DESC')
            .limit(1)
            .then(result =>{
                if(result.length == 0)
                    return {
                        status: 404,
                        success: false,
                        errorMsg: 'user_id not found'
                    }
                result = result[0]
                return {
                    success: true,
                    result: {
                        id: result.uid,
                        name: result.name,
                        age: result.age,
                        email: result.email,
                        image: result.image,
                        signature: result.signature,
                        subscription:{
                            email: result.customer_email,
                            status: result.status,
                            payment_status: result.payment_status,
                            subscription_status: result.status,
                            started_at: result.started_at,
                            end_at: result.end_at,
                            total: result.total,
                            has_disputed: result.has_disputed,
                            disputed_reason: result.disputed_reason,
                            disputed_status: result.disputed_status,
                            invoice_pdf: result.invoice_pdf,
                            total: result.total
                        }
                    }
                }
            }).catch(err => {
                console.log(err)
            })
    }


    function setFav(req,res){
        const {
            user_id,
            partner_id,
        } = req.body

        if(!user_id || !partner_id)
            return res.status(400).json({
                success: false,
                errorMsg: "empty fields"
            })

        app.db('favorites')
            .insert({
                user_id,
                partner_id
            })
            .then(_ => res.status(201).json({
                success:true
            }))
            .catch(err => res.status(400).json(err))
    }

    function delFav(req,res){
        const {
            user_id,
            partner_id,
        } = req.body

        if(!user_id || !partner_id)
            return res.status(400).json({
                success: false,
                errorMsg: "empty fields"
            })

        app.db('favorites')
            .where({
                user_id,
                partner_id
            })
            .del()
            .then(_ => res.status(200).json({
                success:true
            }))
            .catch(err => res.status(400).json(err))
    }
    async function allFavs(req,res){
        const { user_id } = req.params

        if(!user_id)
            return res.status(400).json({
                success: false,
                errorMsg: "empty fields"
            })
        
        return res.status(200).json({
            success: true,
            results: await getAllFavs(user_id)
        })
        
    }
    async function getAllFavs(user_id){
        const favs = await app.db('parceiro')
                            .select(
                                'id',
                                'nome_negocio',
                                'descricao_negocio',
                                'endereco',
                                'horario_funcionamento',
                                'telefone',
                                'image_bar',
                                'url_facebook',
                                'url_instagram')
                            .innerJoin('favorites','favorites.partner_id','parceiro.id')
                            .where({user_id})
                            .orderBy('id','ASC')
        
        return favs
    }
    return {
        createUser,
        updateUser,
        deleteUser,
        getAllUser,
        getAllUserInfo,
        userInfo,
        setFav,
        delFav,
        allFavs,
        getDaysBar
    };  
}
