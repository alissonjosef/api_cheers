const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const nodemailer = require('nodemailer')
const crypto = require("crypto");

module.exports = app => {
    const signin = async (req, res) => {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send('Dados incompletos')
        }

        const parceiro = await app.db('parceiro')
            .whereRaw("LOWER(email) = LOWER(?)", req.body.email)
            .first()

        if (parceiro) {
            bcrypt.compare(req.body.password, parceiro.password, (err, isMatch) => {
                if (err || !isMatch) {
                    return res.status(401).send('A senha informada é inválida!')
                }

                const payload = {
                    id: parceiro.id,
                    nome: parceiro.nome,
                    email: parceiro.email
                }

                res.json({
                    id: parceiro.id,
                    nome: parceiro.nome,
                    email: parceiro.email,
                    nome_negocio: parceiro.nome_negocio,
                    descricao_negocio: parceiro.descricao_negocio,
                    endereco: parceiro.endereco,
                    horario_funcionamento: parceiro.horario_funcionamento,
                    telefone: parceiro.telefone,
                    image_bar: parceiro.image_bar,
                    url_facebook: parceiro.url_facebook,
                    url_instagram: parceiro.url_instagram,
                    token: jwt.encode(payload, authSecret),
                    success: true
                })
            })
        } else {
            res.status(400).send('Usuário não cadastrado!')
        }
    }

    const signinUser = async (req, res) => {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send('Dados incompletos')
        }

        const users = await app.db('users')
            .whereRaw("LOWER(email) = LOWER(?)", req.body.email)
            .first()

        if (users) {
            bcrypt.compare(req.body.password, users.password, async (err, isMatch) => {
                if (err || !isMatch) {
                    return res.status(401).send('A senha informada é inválida!')
                }
                const payload = {
                    id: users.id,
                    nome: users.name,
                    email: users.email
                }


                const tempInfo = await app.api.user.userInfo(users.id)
                if (!tempInfo?.success)
                    return res.status(tempInfo.status).json({
                        success: false,
                        errorMsg: tempInfo.errorMsg
                    })

                tempInfo.result.token = jwt.encode(payload, authSecret)
                return res.status(200).json(tempInfo)
            })
        } else {
            res.status(400).send('Usuário não cadastrado!')
        }
    }

    const forgotPasswordParceiro = async (req, res) => {
        const { email } = req.body
        if (!email) {
            return res.status(400).send('Dados incompletos')
        }

        const parceiro = await app.db('parceiro')
            .whereRaw("LOWER(email) = LOWER(?)", req.body.email)
            .first()

        if (parceiro) {
            const passwordUnique = crypto.randomBytes(4).toString("HEX");

            const transport = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                auth: {
                    user: "comercial@cheersclube.com.br",
                    pass: "BrasilCheers01!!"
                }
            });

            const message = {
                from: "comercial@cheersclube.com.br",
                to: email,
                subject: "Condigo de Recuperar senha",
                text: "Plaintext version of the message",
                html: `<p>Olá, seu codigo de acesso : ${passwordUnique}</p>`
            };


            console.log("🚀 ~ file: auth.js:114 ~ forgotPassword ~ passwordUnique", passwordUnique)

            transport.sendMail(message)

            await app.db('parceiro')
                .where({ email })
                .update({
                    password_key: passwordUnique,
                });

            return res.status(200).send('Email enviado ')

        } else {
            res.status(400).send('Usuário não cadastrado!')
        }

    }

    const codeParceiro = async (req, res) => {

        const { passwordKey, email } = req.body

        if (!passwordKey || !email) {
            return res.status(400).send('Dados Invalido')
        }

        const parceiro = await app.db('parceiro')
            .where("email", email)
            .andWhere('password_key', passwordKey)
            .first()

        return res.status(200).json({ valido: parceiro != undefined })


    }

    const obterHash = async (password, callback) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, null, (err, hash) => callback(hash))
        })
    }

    const resetPasswordParceiro = async (req, res) => {
        const { password, email } = req.body
        const { passwordKey } = req.params

        if (!password || !passwordKey) {
            return res.status(400).send('Dados Invalido')
        }

        const filtro = { password_key: passwordKey, email: email };

        const parceiro = await app.db('parceiro')
            .where(filtro)
            .first()

        if (parceiro) {
            try {
                await obterHash(req.body.password, async hash => {
                    await app.db('parceiro')
                        .where(filtro)
                        .update({
                            password_key: null,
                            password: hash
                        });
                })
                res.status(200).send('Senha atualizada')
            } catch (err) {
                console.log(err)
                res.status(400).send('Erro ao atualizar senha')

            }

        } else {
            res.status(400).send('Dado não conferem')
        }


    }

    const forgotPasswordUser = async (req, res) => {
        const { email } = req.body
        if (!email) {
            return res.status(400).send('Dados incompletos')
        }

        const users = await app.db('users')
            .whereRaw("LOWER(email) = LOWER(?)", req.body.email)
            .first()

        if (users) {
            const passwordUnique = crypto.randomBytes(4).toString("HEX");

            const transport = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                auth: {
                    user: "comercial@cheersclube.com.br",
                    pass: "BrasilCheers01!!"
                }
            });

            const message = {
                from: "comercial@cheersclube.com.br",
                to: email,
                subject: "Condigo de Recuperar senha",
                text: "Plaintext version of the message",
                html: `<p>Olá, seu codigo de acesso : ${passwordUnique}</p>`
            };


            console.log("🚀 ~ file: auth.js:114 ~ forgotPassword ~ passwordUnique", passwordUnique)

            transport.sendMail(message)

            await app.db('users')
                .where({ email })
                .update({
                    password_key: passwordUnique,
                });

            return res.status(200).send('Email enviado ')

        } else {
            res.status(400).send('Usuário não cadastrado!')
        }

    }

    const codeUser = async (req, res) => {

        const { passwordKey, email } = req.body

        if (!passwordKey || !email) {
            return res.status(400).send('Dados Invalido')
        }

        const users = await app.db('users')
            .where("email", email)
            .andWhere('password_key', passwordKey)
            .first()

        return res.status(200).json({ valido: users != undefined })


    }

    const resetPasswordUser = async (req, res) => {
        const { password, email } = req.body
        const { passwordKey } = req.params

        if (!password || !passwordKey) {
            return res.status(400).send('Dados Invalido')
        }

        const filtro = { password_key: passwordKey, email: email };

        const user = await app.db('users')
            .where(filtro)
            .first()

        if (user) {
            try {
                await obterHash(req.body.password, async hash => {
                    await app.db('users')
                        .where(filtro)
                        .update({
                            password_key: null,
                            password: hash
                        });
                })
                res.status(200).send('Senha atualizada')
            } catch (err) {
                console.log(err)
                res.status(400).send('Erro ao atualizar senha')

            }

        } else {
            res.status(400).send('Dado não conferem')
        }


    }

    return { signin, signinUser, forgotPasswordParceiro, resetPasswordParceiro, codeParceiro, forgotPasswordUser, resetPasswordUser, codeUser }
}