# Slide_Handler
Alexa Slide Show Presentation Handler

The files in this collection are used to create a slide show handler that can be called on by Alexa.

It is expected that you have installed the AWS CLI software and its xcode GUI and know how to use ASK deploy

Your Lambda project must include Alexa and DynamoDB triggers

You will need to edit the files to include your own skill ID and Lambda ARN

Use CreateTable.js to create a new DynamoDB database
Edit MySlideShow.json to contain your own slide content.
Load the data from MySlideShow.json into the database with the LoadData.js script.

To Invoke the skill, say 'Alexa, tell slide hander slide 1'  or Alexa, tell slidehander 1'

You can say 'Next' or 'Previous' after a slide has been spoken or say 'stop'

You can change the presentation name by saying 'Alexa, set presentation name to YOURNAME'
Alexa will remember the presentation name and slide number you are on.

If you have asked Alexa for slide 1, you can then just say 'Alexa tell slide handler next'



