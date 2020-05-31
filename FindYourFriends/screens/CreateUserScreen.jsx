import React, { useState } from 'react'
import {
  View,
  Button,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import Input from '../components/Input'
import facade from '../facade'
import { useMutation } from '@apollo/react-hooks'
import badPasswords from '../utils/badPasswords'
import Alert from '../utils/MakeAlert'
import colors from '../constants/colors'
import Card from '../components/Card'
import handleError from "../utils/ErrorHandler";
let badPasswordsArray = badPasswords.split('\n')

const CreateUser = props => {
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [addUser, { loading, error, data, called }] = useMutation(
    facade.ADD_USER
  )
  if (called && error) {
    const errorMsg = handleError(error)
    Alert(errorMsg.message, errorMsg.title)
  }
  // Sadly the value passed to the function in onChangeText is only the value of the element (what the user typed)
  // and not an event with more data than just a string. This means that you can't a generic handler
  // that can handle the input of all the input fields since we can't access any id or anything from the event
  // If you find a smarter way to do this, please do optimize it!
  function handleUsernameInput (value) {
    newUser.username = value
    setNewUser({ ...newUser })
  }
  function handleEmailInput (value) {
    newUser.email = value
    setNewUser({ ...newUser })
  }
  function handlePasswordInput (value) {
    newUser.password = value
    setNewUser({ ...newUser })
  }
  function handlePassword2Input (value) {
    newUser.password2 = value
    setNewUser({ ...newUser })
  }

  // Thanks to this dude for the regex: https://stackoverflow.com/questions/7844359/password-regex-with-min-6-chars-at-least-one-letter-and-one-number-and-may-cont
  function checkPwd (str) {
    if (str.length < 10) {
      return 'Your password is too short'
    } else if (str.length > 30) {
      return 'Your password is too long'
    } else if (str.search(/\d/) == -1) {
      return 'Your password must contain a number'
    } else if (str.search(/[a-zA-Z]/) == -1) {
      return 'Your password must contain a letter'
    } else if (str.search(/[\!\@\#\$\%\^\=\&\*\(\)\_\+\-]/) == -1) {
      return 'Your password must contain a symbol'
    } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\=\&\*\(\)\_\+\-]/) != -1) {
      return 'Your password has invalid characters in it'
    }
    return 'ok'
  }

  async function confirmCreate () {
    const NoInputAlert = input => {
      Alert(`Please provide a ${input}.`, `Missing ${input}`)
    }
    // Check if user has provided a username
    if (newUser.username == '') {
      NoInputAlert('username')
      return
    }
    // Check if user has provided an email
    if (newUser.email == '') {
      NoInputAlert('email')
      return
    }
    // Check if password is empty
    if (newUser.password == '') {
      NoInputAlert('password')
      return
    }
    // Check if password follows the basic rules
    const passwordCheck = checkPwd(newUser.password)
    if (passwordCheck != 'ok') {
      Alert(passwordCheck)
      return
    }
    // Check if user has typed the same password twice
    if (newUser.password != newUser.password2) {
      Alert("The passwords don't match")
      // We reset the passwords after failed attempts of creating a user
      // One is set to null and one is set to an empty string so the password input fields get cleared
      // but still don't have the same value
      newUser.password = ''
      newUser.password2 = null
      setNewUser({ ...newUser })
      return
    }
    // Check if password is on the list of well known bad passwords
    let isBadPassword = false
    for (let index = 0; index < badPasswordsArray.length; index++) {
      const password = badPasswordsArray[index]
      if (newUser.password.includes(password)) {
        isBadPassword = true
        break
      }
    }
    if (isBadPassword) {
      Alert('Your password is too weak')
      return
    }
    // If everything is okay then we add the user
    await addUser({
      variables: {
        input: {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password
        }
      }
    })
    console.log('Created new user')
    setNewUser({})
    Alert('User successfully created', 'Success!')
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss()
      }}
    >
      <View style={styles.screen}>
        <Card style={styles.container}>
          <Text style={styles.title}>Create User</Text>
          <Input
            style={styles.input}
            onChangeText={handleUsernameInput}
            name='username'
            value={newUser.username}
            placeholder='USERNAME'
          ></Input>
          <Input
            style={styles.input}
            onChangeText={handleEmailInput}
            name='email'
            keyboardType='email-address'
            value={newUser.email}
            placeholder='E-MAIL'
          ></Input>
          <Input
            style={styles.input}
            onChangeText={handlePasswordInput}
            name='password'
            secureTextEntry={true}
            value={newUser.password}
            placeholder='PASSWORD'
          ></Input>
          <Input
            style={styles.input}
            onChangeText={handlePassword2Input}
            name='password2'
            secureTextEntry={true}
            value={newUser.password2}
            placeholder='PASSWORD'
          ></Input>
          <View style={styles.button}>
            <Button
              color={colors.primary}
              title='CREATE ME'
              onPress={confirmCreate}
            />
          </View>
          <View style={styles.button}>
            <Button
              color={colors.secondary}
              title='TAKE ME BACK'
              onPress={() => props.navigation.goBack()}
            />
          </View>
        </Card>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10
  },
  text: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center'
  },
  container: {
    width: 300,
    maxWidth: '80%',
    alignItems: 'center'
  },
  input: {
    width: 100,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 15
  },
  button: {
    width: 110,
    marginVertical: 10
  }
})

export default CreateUser
