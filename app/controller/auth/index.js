const { User } = require('../../model')
const {authValidationSchema} = require('./validator')
const jwt = require('jsonwebtoken')

exports.login = async(req, res) => {
    const {error} = authValidationSchema.validate(req.body)

    if(error){
        res.status(400).send({message: error.details[0].message})
    }

    const user = await User.findOne({where: {email: req.body.email, password: req.body.password}})

    if(user){
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRETKEY, { expiresIn: '1h' });

        res.status(200).send({
            message: 'Loggin successfully',
            token: token
        })
    }
}

exports.update = async (req, res) => {
    const resourceId = req.params.id;
    const updatedData = req.body;
  
    // Update resource logic
    User.update(updatedData, { where: { id: resourceId } })
      .then(() => {
        // Notify all WebSocket clients about the update
        io.emit('resourceUpdated', { id: resourceId, data: updatedData });
        res.status(200).send('Resource updated successfully');
      })
      .catch(err => res.status(500).send('Error updating resource'));
};

exports.logout = async(req, res) => {
    const userId = req.user.id; // assuming JWT middleware for user extraction
  
    if (activeSessions.has(userId)) {
      const socketId = activeSessions.get(userId);
      io.to(socketId).emit('forceLogout', 'Logged out by user');
      io.sockets.sockets.get(socketId)?.disconnect();
    }
  
    activeSessions.delete(userId);
    res.sendStatus(200);
};
  
  