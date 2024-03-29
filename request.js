import fetch from 'node-fetch';
import { DEXES } from './utils.js';
import { metadataExists, readMetadata, writeMetadata } from './persistence.js';

const getPairs = (dex) => {
  return {
    JOE: getTJPairs,
    PNG: getPPairs
  }[dex]
}

export const getLPMetadata = async (useCached=false) => {
  if (useCached && metadataExists()) {
    return readMetadata()
  }

  const fetches = await Promise.all(DEXES.map(dex => getPairs(dex)()))

  let data = {}
  for (let i = 0; i < DEXES.length; i++) {
    data[DEXES[i]] = []
    for (const pair of fetches[i].data.pairs) {
      data[DEXES[i]].push({
        id: pair.id,
        token0: {
          id: pair.token0.id,
          symbol: pair.token0.symbol
        },
        token1: {
          id: pair.token1.id,
          symbol: pair.token1.symbol
        },
      })
    }
  }

  writeMetadata(data)

  return data
}

const getTJPairs = async () => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://traderjoexyz.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"operationName\":\"pairsQuery\",\"variables\":{\"first\":500,\"skip\":0,\"orderBy\":\"reserveUSD\",\"orderDirection\":\"desc\",\"dateAfter\":1637416800},\"query\":\"query pairsQuery($first: Int! = 1000, $skip: Int! = 0, $orderBy: String! = \\\"reserveUSD\\\", $orderDirection: String! = \\\"desc\\\", $dateAfter: Int! = 1622419200) {\\n  pairs(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\\n    id\\n    name\\n    token0Price\\n    token1Price\\n    token0 {\\n      id\\n      symbol\\n      decimals\\n      __typename\\n    }\\n    token1 {\\n      id\\n      symbol\\n      decimals\\n      __typename\\n    }\\n    reserve0\\n    reserve1\\n    reserveUSD\\n    volumeUSD\\n    hourData(first: 24, where: {date_gt: $dateAfter}, orderBy: date, orderDirection: desc) {\\n      untrackedVolumeUSD\\n      volumeUSD\\n      date\\n      volumeToken0\\n      volumeToken1\\n      __typename\\n    }\\n    timestamp\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  })
  return await res.json();
}

const getPPairs = async () => {
  const res = await fetch("https://api.thegraph.com/subgraphs/name/pangolindex/exchange", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://info.pangolin.exchange/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"operationName\":\"pairs\",\"variables\":{\"allPairs\":[\"0x7c05d54fc5cb6e4ad87c6f5db3b807c94bb89c52\",\"0xd7538cabbf8605bde1f4901b47b8d42c61de0367\",\"0xe28984e1ee8d431346d32bec9ec800efb643eef4\",\"0xe530dc2095ef5653205cf5ea79f8979a7028065c\",\"0xbd918ed441767fe7924e99f6a0e0b568ac1970d9\",\"0x42152bdd72de8d6767fe3b4e17a221d6985e8b25\",\"0xba09679ab223c6bdaf44d45ba2d7279959289ab0\",\"0xd2f01cd87a43962fd93c21e07c1a420714cc94c9\",\"0xed7a2b4054757cfdb632af15ad528624f0fff3b0\",\"0x5875c368cddd5fb9bf2f410666ca5aad236dabd4\",\"0x1acf1583bebdca21c8025e172d8e8f2817343d65\",\"0x5764b8d8039c6e32f1e5d8de8da05ddf974ef5d3\",\"0x4a2cb99e8d91f82cf10fb97d43745a1f23e47caa\",\"0x381cc7bcba0afd3aeb0eaec3cb05d7796ddfd860\",\"0xb714d14ee6b5b194644e206c2342b8d95efb6379\",\"0x73e6cb72a79dea7ed75ef5ed6f8cff86c9128ef5\",\"0x497070e8b6c55fd283d8b259a6971261e2021c01\",\"0x494dd9f783daf777d3fb4303da4de795953592d0\",\"0x2b532bc0afae65da57eccfb14ff46d16a12de5e6\",\"0x0a63179a8838b5729e79d239940d7e29e40a0116\",\"0xd27688e195b5495a0ea29bb6e9248e535a58511e\",\"0x0ce543c0f81ac9aaa665ccaae5eec70861a6b559\",\"0x51486d916a273bea3ae1303fca20a76b17be1ecd\",\"0x04d80d453033450703e3dc2d0c1e0c0281c42d81\",\"0x1bb5541eccda68a352649954d4c8ece6ad68338d\",\"0x5be4063911d88fd07122671c9f3c94693846787c\",\"0xed764838fa66993892fa37d57d4036032b534f24\",\"0x4555328746f1b6a9b03de964c90ecd99d75bffbc\",\"0xd05e435ae8d33fae82e8a9e79b28aaffb54c1751\",\"0x62a2f206cc78babac9db4dbc0c9923d4fddef047\",\"0x1ffb6ffc629f5d820dcf578409c2d26a2998a140\",\"0xd69de4d5ff6778b59ff504d7d09327b73344ff10\",\"0x792055e49a6421f7544c5479ecc380bad62bc7ee\",\"0x99dd520748eb0355c69dae2692e4615c8ab031ce\",\"0xa34862a7de51a0e1aee6d3912c3767594390586d\",\"0x9613acd03dcb6ee2a03546dd7992d7df2aa62d9a\",\"0xb57c80a860e510e15d4ce01af944e65ccf9cd673\",\"0xbccebf064b8fcc0cb4df6c5d15f9f6fead3df88d\",\"0x8ded946a4b891d81a8c662e07d49e4daee7ab7d3\",\"0xd24d216a8a761e36f2158f6492d952799d231b5c\",\"0xe36ae366692acbf696715b6bddce0938398dd991\",\"0xa1c2c3b6b120cbd4cec7d2371ffd4a931a134a32\",\"0xe6069a6e52f6afec673d44948f6f4b06e4517d3d\",\"0x66eecc97203704d9e2db4a431cb0e9ce92539d5a\",\"0x7a020cf4fd731a6482ef4c752f096dce329f2b0b\",\"0x50e7e19281a80e3c24a07016edb87eba9fe8c6ca\",\"0xf62381affdfd27dba91a1ea2acf57d426e28c341\",\"0x7b2ac2b1d8d9abfb95570c1389ca3750cf180fc2\",\"0xffc53c9d889b4c0bfc1ba7b9e253c615300d9ffd\",\"0x5085678755446f839b1b575cb3d1b6ba85c65760\",\"0x551d0b15423d391d89cb3c5e6fb1bf9b28495fe4\",\"0xaa9a58792cbfa3de9cef36a5cf0e3608a6a106b7\",\"0x2f151656065e1d1be83bd5b6f5e7509b59e6512d\",\"0x7056b72d60c5784fc3a2071777e7b0631ec7185c\",\"0x6b41673feff1bf0b55ba2c9f4bf213b2be8f474d\",\"0xf776ef63c2e7a81d03e2c67673fd5dcf53231a3f\",\"0xf277e270bc7664e6ebba19620530b83883748a13\",\"0x4716b506077bce6caf8c77e932785e711afe4b3a\",\"0x5944f135e4f1e3fa2e5550d4b5170783868cc4fe\",\"0xf4880e0f384206401950a82da83cf7536036783a\",\"0x97b4957df08e185502a0ac624f332c7f8967ee8d\",\"0xd89dd8dcef91bee0a46d57681473b5ce824d3adf\",\"0x662135c6745d45392bf011018f95ad9913dcbf5c\",\"0x985c2b7ca25fd79b07f5af33f11bf03a6119bf49\",\"0x59748d12ec2bf081b306821ee1201a463f94fea4\",\"0xc5ab0c94bc88b98f55f4e21c1474f67ab2329cfd\",\"0x851d47be09bd0d3c2b24922e34a4f8ae05456924\",\"0x9ee0a4e21bd333a6bb2ab298194320b8daa26516\",\"0x4f20e367b10674cb45eb7ede68c33b702e1be655\",\"0x960fa242468746c59bc32513e2e1e1c24fdfaf3f\",\"0x07dca207001d5c523749b0b4704d7b81535c6f1f\",\"0xabc57d7ce306dedf9a585c78cbf019776e771d5c\",\"0x82ab53e405fa94448597afcc0ba86143b1ab2628\",\"0xcf35400a595efcf0af591d3aeb5a35cbcd120d54\",\"0x7a6131110b82dacbb5872c7d352bfe071ea6a17c\",\"0xa8d0c8710d8393e496e20fbaa844b8eb7a0801bc\",\"0x278f24a782b96be10f15df93487aec5331cfdff1\",\"0x8861180e26f11cd3ab5faad4a41d026da3936624\",\"0xdb99cde705443e1c6c09edfc7359b9806e0f5d90\",\"0xeb1e36dbf4669396a8c7b2403efd3a16ad64f3ba\",\"0x603efefc3ed65e3f5b6730c603b0cfb4426e0f4f\",\"0x6745d7f9289d7d75b5121876b1b9d8da775c9a3e\",\"0x42c45fe57927ab94f5ba5484483b67184aa82e5d\",\"0xd8b262c0676e13100b33590f10564b46eef652ad\",\"0x0b1efd689eba7e610955d0fabd9ab713a04c3895\",\"0x12f3392825af66e81718689e97b7d9a01f940932\",\"0x012ff8b3bdd7c09ec600c92485507408a6ec9e19\",\"0x134ad631337e8bf7e01ba641fb650070a2e0efa8\",\"0xbf58b762b1dc00beb8a66e1680b028ded0ad8868\",\"0x5f233a14e1315955f48c5750083d9a44b0df8b50\",\"0x24df88626312d37b1cbb46d2e0491477d1bec84a\",\"0x18c8e1346d26824063706242adb391ddb16c293e\",\"0x17a2e8275792b4616befb02eb9ae699aa0dcb94b\",\"0xc33ac18900b2f63dfb60b554b1f53cd5b474d4cd\",\"0xc13e562d92f7527c4389cd29c67dabb0667863ea\",\"0x87b1cf8f0fd3e0243043642cea7164a67cb67e4d\",\"0xbbc7fff833d27264aac8806389e02f717a5506c9\",\"0x0a1041feb651b1daa2f23eba7dab3898d6b9a4fe\",\"0xad24a72ffe0466399e6f69b9332022a71408f10b\",\"0x53b37b9a6631c462d74d65d61e1c056ea9daa637\",\"0x9d472e21f6589380b21c42674b3585c47b74c891\",\"0x42d737d6349f45ab877e50b6518317d6444f3366\",\"0x7ece5fc08050f8007188897c578483aabd953bc2\",\"0xf372ceae6b2f4a2c4a6c0550044a7eab914405ea\",\"0xf8aca1f125e56d28f48b2b2f45344d6c98448780\",\"0xb0ab4fd0b29a4c9f8246914cedb8206638803e04\",\"0x1f6dff52b22d793c851d15e2942f6ee97ddcbfba\",\"0x5ac31b3e8b8c47a40c9f2c69a6c0428917737e44\",\"0x295999d4ee08db2bc3d14a33a8b252ee62e853de\",\"0x0a081f54d81095d9f8093b5f394ec9b0ef058876\",\"0x4494147fc4054bff2b9f98bfc28e36a68d769b49\",\"0xd7cdef6532ee0a8e332239df4b22783eb8142809\",\"0x560499423ed762564ef5313d983587b1b1476fa2\",\"0x6f99bccc2e643ceeba7d912aefe84df952a65f5f\",\"0xe44ef634a6eca909ecb0c73cb371140de85357f9\",\"0xae194a23a503793498d76769114e7c13350789a0\",\"0x67e395b6acd948931eee8f52c7c1fe537e7f1a7a\",\"0x6f7bbbb0644550dd960e4b484c57de6b167d7280\",\"0x43fa677531e123f19c0dbbd72774e33fd6a7b1e7\",\"0x125670a26beb422779e9f47e5e08e3720b58337f\",\"0xe90ef1a7d3d384b0a42b52bd68dc35289a402a1a\",\"0xad8ff4d98e618d55222ed5921d853cc0e57e6859\",\"0x363d093d419093998c06a4f422d73a43156d7f3e\",\"0x70e20cae3c3f299070fb7853c88a6a3a0fc1d5b4\",\"0x340d732f44e2fb8d08719883f1c2ae088eb11682\",\"0x4140b8defdc4124fd420d9ab28860cc23c6e37cc\",\"0x6dc06d2432f8a7733ef89d8ce929fbb0b64c1ab4\",\"0xc74b55bfa52435676a83ed908a96b97df27f66d3\",\"0x230628c1ee684a30b4778dc7eb4638658ad866a1\",\"0x94df699f8aa08314cbdfcca7dd6cfaa5ab9e8e26\",\"0xe64cc27ed4a54ac4fdee31efc56d363af2ee5a13\",\"0x8d0bfc06af725cfaa38672b97c9ffaad16081af9\",\"0x86814aa25b3e2bd15ff7500c907a86f90b8109ce\",\"0x3aef3443c2c9882c06b1c9662d69c29c9cbdb811\",\"0x37b0faea51ea0a2e7ed6c14840e12cc8d5d34fd6\",\"0x5f8a485ca2994c48dee4f03b269da65d7376c6ef\",\"0x317598200315f454d1b5e5cccf07c2e2c6aee172\",\"0x78bd057ac71f5bd2579f4f252e8d0108aaf34960\",\"0x2267b2d6b3cc8cf4d8b96bc91a52613fc175baef\",\"0x92dc558cb9f8d0473391283ead77b79b416877ca\",\"0xbdf5090c1164009bc7814cacbd7b6e3f9093984b\",\"0x46a789dc4fa594fc9e95649efd4c993681bb7262\",\"0xc04de3796716ae5a6788b75dc0d4a1ece06092d9\",\"0x3b7e81e16bd02d7c8f95debbcfab9b1dfa435ee5\",\"0x0a74e59576baa40c4e18603b95e0978340a1935c\",\"0x5a615108e682d71e9726c7c1567f7df968f54ba0\",\"0xd390ebcf321720e1490ce212f4740936135cb635\",\"0x672e8a4993dbec75ee61f125fdf82a3a45a71ace\",\"0x407ffee49d409196c24cd02795e345e84d7c7488\",\"0xc6a9dc8569ada7626b77e04445e93227d0790478\",\"0x5dc964d72bbb9220f6e36316aef4d2d1554ba610\",\"0x9e14ebc3c312d1cada4e16001fd53b222902e103\",\"0x8caef149f1a9e12c19a4525bd4cf7e2f23c49c71\",\"0x9a634ce657681200b8c5fb3fa1ac59eb0662f45c\",\"0x6fcf793458690df8a0280a7a0f59e65666e32eb1\",\"0xe5f60a5a1627695f579722e92919ad83a35293eb\",\"0x997983f336e3a51236c458357667bf8ff8c86d4c\",\"0xbaa1785b9fda7bd5f890e8ae464352b9f6d0cb10\",\"0x0d5ccba367722aa36a87588dc03ebc217b6a1a49\",\"0xe7a953bef0923e795a98176d8066c3bff3f46374\",\"0xe8acf438b10a2c09f80aef3ef2858f8e758c98f9\",\"0x19ff309a15dadfcf58ce1b23931e543efd5b4c7d\",\"0x93d389fbc7ea3770d915cffdeb677ee6b4d4ccaf\",\"0x6e256c05e3146b0bff1d85d22770e5a096b7fa88\",\"0xafa6f436383e4eae9d9326a8ce9c6d9f77224cc3\",\"0x5114f275f53149bbfc271575263689b516f70826\",\"0x9384a928c8a8f42188af2acc72a782b9920907c3\",\"0xba2c73113f0b58887bd1cb17b2b3b35cab633526\",\"0x55d04cdeede62fda88728398daa857b0f8560003\",\"0x792828974273725a7027da1c2341f4162e17174b\",\"0xe58c6df77f0ba6aad7e654d106f282afd492f500\",\"0xe31f227e3bffdc4a40ba0bf12a9622dbf8034b27\",\"0x13beb85d61035dc51480ab230ce1cbaa8cc551da\",\"0x49f94226ea30201ddb0307080b0a20dd1c27b917\",\"0x1054f72a7eb9cf82cefd104ac9d716626607a8e7\",\"0xc91e49f165cab7e96ac7f7f460ebf2964cc4bb76\",\"0x66ba9619ca10bf77176afecc2486344fa9bc65b3\",\"0x334fd3526d5f55301ff3faa0fc231d38fa45e342\",\"0xed84fedb633d0523de53d46c8c99cbae1f89d3b0\",\"0xce8d21a303b28d8ce00c0807acfe99f9b761c880\",\"0x33d1f36dc53a1927b4382568e09fabd7bc361094\",\"0xdc5d01a8cc5828ddb38f799a3cf8f3d1a5ddc0f7\",\"0x3c6bb52e72467f46bae149a79c11d2299b63c56f\",\"0x15d253f2e69569eb726a5c2317d442bf21a45c2f\",\"0xe1f253ea28f778dbc7ceba3bdc9e001a918b7dbe\",\"0xe9dfcabaca5e45c0f3c151f97900511f3e73fb47\",\"0xc4877c4aa3677888c0e383522fe0807680ce9a4d\",\"0xe63c7a78790b2914f0456f763e0f28e83743006e\",\"0xd895cc41d823f75ecdee52ea102928ca3b5c7099\",\"0x3dcc9711558115bfb73db19e8326cd717f6e5540\",\"0xb8258d7148b25d67f474a3d067cd26a805fb79ea\",\"0xdc24829c5281cd26a2d4dc334d228d1e22652b79\",\"0xcc62fdaeb54aee5348b41a68e64e9abb10f0dde5\",\"0xf4ee52ac89273fd8d114b08711acaa546a50a5f1\",\"0x8b878bd74122ee27a40fccd0fafb83dbd5d2fcaf\",\"0xc53ce5488ae19cbe0704ad456cdea8b54a7918b2\",\"0xa8bffe10a9de3821f397d213b44e2cd685f676e1\",\"0x9743c97c03dd7c072d31579d9b534fe63136a683\",\"0x791e4152b9306032c36950b140a5dae3f90f0d93\",\"0x4cf3e498e9f191332badef0b09314ef3d1075e4e\"]},\"query\":\"fragment PairFields on Pair {\\n  id\\n  txCount\\n  token0 {\\n    id\\n    symbol\\n    name\\n    totalLiquidity\\n    derivedETH\\n    __typename\\n  }\\n  token1 {\\n    id\\n    symbol\\n    name\\n    totalLiquidity\\n    derivedETH\\n    __typename\\n  }\\n  reserve0\\n  reserve1\\n  reserveUSD\\n  totalSupply\\n  trackedReserveETH\\n  reserveETH\\n  volumeUSD\\n  untrackedVolumeUSD\\n  token0Price\\n  token1Price\\n  createdAtTimestamp\\n  __typename\\n}\\n\\nquery pairs($allPairs: [Bytes]!) {\\n  pairs(where: {id_in: $allPairs}, orderBy: trackedReserveETH, orderDirection: desc) {\\n    ...PairFields\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  })
  return await res.json();
}
