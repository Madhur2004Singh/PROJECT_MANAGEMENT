import Mailgen  from "mailgen";
import nodemailer from "nodemailer";

// Sending test emails using nodemailer and Mailtrap.
const sendEmail=async(options)=>{
    const mailGenerator=new Mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagerlink.com"
        }
    })
    // For those who do not support HTML.
    const emailTextual=mailGenerator.generatePlaintext(options.mailgenContent);

    //  For those who do support HTML.
    const emailHtml=mailGenerator.generate(options.mailgenContent);

    const transporter=nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail={
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed!")
    }

}







// Here we have generated the content for the e-mail.


const emailVerificationMailgenContent=(username,verificationURL)=>{
    return{
        body: {
            name: username,//If username = "Madhur", the email will greet the user by name.
            intro: "Welcome to our app! we're excited to have you onboard",
            action:{
                instructions:
                "To verify your email, please click on the following button",
                button:{
                    color: "#22BC66",
                    text:"Verify your email",
                    link:verificationURL,
                },
            },
            outro:"Need help or have questions, just reply to this email. We would love to help!"
        },
    };
};

const forgotPasswordMailgenContent=(username,passwordResetURL)=>{
    return{
        body: {
            name: username,//If username = "Madhur", the email will greet the user by name.
            intro: "We got a request to reset the password of your account.",
            action:{
                instructions:
                "To reset your password click on the following button or link.",
                button:{
                    color: "#22BC66",
                    text:"Reset Password",
                    link:passwordResetURL,
                },
            },
            outro:"Need help or have questions, just reply to this email. We would love to help!"
        },
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}