import Web3 from 'web3';
import { create } from 'ipfs-http-client';

const rater = require("rater-js");

// Create an IPFS client instance
const ipfs = create({ host: 'webui.ipfs.io.ipns.localhost', port: '5001', protocol: 'http' });

// Create a Web3 instance using MetaMask provider
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

const contractBuild = require('../back-end/build/contracts/FreeTourContract.json');
const networkId = "5777";
const contractAddress = contractBuild.networks[networkId].address;
const contractABI = contractBuild.abi;
const contract = new web3.eth.Contract(contractABI, contractAddress);

let account;

async function fetchGuideFromIpfs(ipfsHash) {
  // Get the file from IPFS
  const chunks = [];
  for await (const chunk of ipfs.cat(ipfsHash)) {
    chunks.push(chunk);
  }
  const data = Buffer.concat(chunks);

  // Convert Buffer to string
  const jsonGuide = data.toString();
  return JSON.parse(jsonGuide);
}

async function connect() {
  // Request access to the user's MetaMask account
  await window.ethereum.enable();

  // Get the selected account
  const accounts = await ethereum.request({ method: 'eth_accounts' });;
  account = accounts[0];

  document.getElementById('sign-in-div').innerHTML = account;
  document.getElementById('sign-in-div').className = "account";
  document.getElementById('create-guide-nav').style = "";
  listGuides();
}

document.getElementById('sign-in-btn').addEventListener('click', connect);

async function uploadGuide() {
  const title = document.getElementById('new-guide-title').value;
  const description = document.getElementById('new-guide-description').value;
  const location = document.getElementById('new-guide-location').value;

  try {
    // Add guide to IPFS
    const guide = { title, description, location };
    console.log("Subiendo guia");
    const addedGuide = await ipfs.add(JSON.stringify(guide));
    const ipfsHash = addedGuide.path;

    console.log("Hash de la guia:", ipfsHash)

    // Upload IPFS hash to smart contract
    await contract.methods.uploadGuide(ipfsHash).send({from: account, gas: '1000000000'});
  } catch (error) {
    console.error(error);
    alert('Se produjo un fallo al crear la guía. Por favor vuelva a intentarlo.');
  }
  listGuides();
}

document.getElementById('create-btn').addEventListener('click', uploadGuide);

async function editGuide(event) {
  let guideId = event.currentTarget.guideId;
  const newTitle = document.getElementById(`guide-${guideId}-edit-title`).value;
  const newDescription = document.getElementById(`guide-${guideId}-edit-description`).value;
  const newLocation = document.getElementById(`guide-${guideId}-edit-location`).value;

  try {
    // Add new guide content to IPFS
    const guide = { title: newTitle, description: newDescription, location: newLocation };
    const addedGuide = await ipfs.add(JSON.stringify(guide));
    const ipfsHash = addedGuide.path;

    // Update IPFS hash in smart contract
    await contract.methods.editGuide(guideId, ipfsHash).send({from: account, gas: '1000000000'});

  } catch (error) {
    console.error(error);
    alert('Se produjo un fallo al editar la guía. Por favor vuelva a intentarlo.');
  }
  listGuides();
}

async function evaluateGuide(guideId, score) {
  try {
    await contract.methods.evaluateGuide(guideId, score).send({from: account, gas: '1000000000'});
  } catch (error) {
    console.error(error);
    alert('Por favor, conecta tu cartera para poder evaluar guías.');
  }
  listGuides();
}

async function listGuides() {
  const guideCount = await contract.methods.guideCount().call();
  let guideListDiv = document.getElementById('guideList');
  guideListDiv.innerHTML = '';

  let images = [
    "https://images.unsplash.com/photo-1509845350455-fb0c36048db1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1533056903395-a36fb8a4ac8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1585004607620-fb4c44331e73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  ]
  
  for (let i = 0; i < guideCount; i++) {
      let guide = await contract.methods.guides(i).call();
      let guideIPFS = await fetchGuideFromIpfs(guide.ipfsHash);
      let imageSrc = images[i % images.length]

      let editButton = `<p class="more" onclick="enableEditGuide(${i})">EDITAR GUÍA</p>`
      guideListDiv.innerHTML += `
      <div class="col-lg-4 col-md-8 col-sm-10">
        <div class="single-blog blog-style-one" id="guide-${i}">
          <div class="blog-image">
            <a href="javascript:void(0)">
              <img src="${imageSrc}" alt="Blog" />
            </a>
            <a href="javascript:void(0)" class="category">
              <i class="lni lni-map-marker me-1"></i>
              <div style="display: inline" id="guide-${i}-location">${guideIPFS.location}</div>
              <input id="guide-${i}-edit-location" type="text" value="${guideIPFS.location}" style="display: none">
            </a>
          </div>
          <div class="blog-content">
            <div id="rater${i}"></div>
            <div style="float: right">${guide.reviews} reviews</div>
            <h5 class="blog-title">
              <a>
              <div style="display: inline" id="guide-${i}-title">${guideIPFS.title}</div>
              <input id="guide-${i}-edit-title" type="text" value="${guideIPFS.title}" style="display: none">
              </a>
            </h5>
            <span><i class="lni lni-user"></i> ${guide.creator}</span>
            <p class="text">
              <div style="display: inline" id="guide-${i}-description">${guideIPFS.description}</div>
              <input id="guide-${i}-edit-description" type="text" value="${guideIPFS.description}" style="display: none">
            </p>
            <div id="edit-guide-button-${i}">
            ${guide.creator.toLowerCase() == account ? editButton : ''}
            </div>
            <div id="edit-buttons-${i}" class="mt-3" style="display: none">
              <button class="btn primary-btn" id="guide-${i}-save-btn">Guardar</button>
              <button class="btn secondary-btn" onclick="disableEditGuide(${i})">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  for (let j = 0; j < guideCount; j++) {
    let guide = await contract.methods.guides(j).call();
    let score = Number(guide.score)
    rater({
      starSize:32,
      rating: score,
      step: 1,
      element: document.querySelector("#rater" + j), 
      rateCallback: function rateCallback(rating, done) {
        this.setRating(rating); 
        evaluateGuide(j, rating)
        done();
      }
    });
    let button = document.getElementById(`guide-${j}-save-btn`)
    button.addEventListener('click', editGuide);
    button.guideId = j;
  }

  let loader = document.getElementById('loader');
  loader.style = "display: none"
}

window.addEventListener("load", listGuides, false); 

// Check if MetaMask is installed
if (typeof window.ethereum === 'undefined') {
  document.getElementById('status').innerHTML = '<strong>Status:</strong> MetaMask not detected';
  document.getElementById('connectButton').disabled = true;
}
