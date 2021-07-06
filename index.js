const fs = require('fs');
const axios = require('axios');

const levels = {
  'Débutant': 1,
  'Intermédiaire': 2,
  'Avancé': 3,
  'Courant': 4,
  'Langue maternelle': 5,
};

const transform = async (input) => {

  // Your code here
  let output;
  let address = new Map()

  //appelle api
  await axios.get('https://restcountries.eu/rest/v2/name/' + input.country)
    .then((response) => {

      Object.keys(input).map(key_address => {
        if (key_address === 'zipCode' || key_address === 'street' || key_address === 'city' || key_address === 'country') {
          address[key_address] = input[key_address]
          if (key_address === 'country') {
            delete address[key_address]
            delete input[key_address]
            key_address.replace(key_address, 'countryCode')
            address['countryCode'] = response.data[0]['alpha2Code']
            input.address = address
          }
          delete input[key_address]
        }
      })
    })
    .catch((error) => {
      console.log(error);
    })

  //birthday
  Object.keys(input).map((key_name => {
    let newkey
    if (key_name === 'birthday') {
      newkey = key_name.replace('birthday', 'dob')
      input[newkey] = input[key_name];
      delete input[key_name]
    }
  }))

  //experiences

  Object.keys(input.experiences[0]).map((key_experience => {

    for (let i = 0; i < input.experiences.length; i++) {

      if (key_experience === 'job') {
        let new_key_experiences
        new_key_experiences = key_experience.replace(key_experience, 'jobId')
        input.experiences[i][new_key_experiences] = input.experiences[i][key_experience];
        input.experiences[i][new_key_experiences] = input.experiences[i][key_experience]['id']
        delete input.experiences[i][key_experience];
      }
    }
  }))

  // certificates
  Object.keys(input.certificates[0]).map((key_certificate => {

    if (key_certificate === 'certificateType') {
      let new_key_certificateType
      new_key_certificateType = key_certificate.replace(key_certificate, 'type')
      input.certificates[0][new_key_certificateType] = input.certificates[0][key_certificate];
      delete input.certificates[0][key_certificate];
      input.certificates[0][new_key_certificateType] = input.certificates[0][new_key_certificateType]['title']
    }
    if (key_certificate === 'certificate') {
      input.certificates[0][key_certificate] = input.certificates[0][key_certificate]['title']
    }
  }))

  // languages
  Object.keys(input.languages[0]).map((key_languages) => {
    let newkey;
    if (key_languages === 'level') {
      newkey = key_languages.replace('level', 'levelTitle')
      input.languages[0][newkey] = input.languages[0][key_languages];
      delete input.languages[0][key_languages];

      Object.keys(levels).map((key_level) => {
        if (key_level === input.languages[0][newkey])
          input.languages[0].level = levels[key_level]
      })
    }
  })

  //inddex key position
  let number_position = []
  Object.keys(input).map((key, index) => {

    switch (key) {
      case 'id':
        (Object.keys(input).indexOf(key) == 0) ? index = 0 : null
        break;
      case 'firstname':
        (Object.keys(input).indexOf(key) == 1) ? index = 1 : null
        break;
      case 'lastname':
        (Object.keys(input).indexOf(key) == 2) ? index = 2 : null
        break;
      case 'dob':
        (Object.keys(input).indexOf(key) == 7) ? index = 3 : null
        break;
      case 'address':
        (Object.keys(input).indexOf(key) == 6) ? index = 4 : null
        break;
      case 'experiences':
        (Object.keys(input).indexOf(key) == 3) ? index = 5 : null
        break;
      case 'certificates':
        (Object.keys(input).indexOf(key) == 4) ? index = 6 : null
        break;
      case 'languages':
        (Object.keys(input).indexOf(key) == 5) ? index = 7 : null
        break;

    }
    number_position.push([index, key])
  })

  // final json
  let newJson = new Map()
  number_position.sort()
  for (let i = 0; i < number_position.length; i++) {
    newJson[number_position[i][1]] = input[number_position[i][1]]
  }

  //console.log(newJson)
  
  output = newJson
  
  return output;
};

(async () => {
  const inStr = fs.readFileSync('./in.json', 'UTF-8');
  const jsonIn = JSON.parse(inStr);
  const output = await transform(jsonIn);
  const outStr = JSON.stringify(output, null, 2);
  fs.writeFileSync('./out.json', outStr);
})();
