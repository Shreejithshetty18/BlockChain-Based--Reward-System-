import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from './contractUtils';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [rewardName, setRewardName] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');
  const [rewards, setRewards] = useState([]);
  const [contract, setContract] = useState(null);

  // Connect Wallet Function (forces MetaMask to ask for account selection)
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request permission to select account
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        setWalletAddress(accounts[0]);
        await loadContract(); // load contract once connected
      } catch (error) {
        console.error('Wallet connection failed:', error);
      }
    } else {
      alert('MetaMask not detected');
    }
  };

  // Auto wallet refresh listener
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          loadContract();
        } else {
          setWalletAddress('');
          setContract(null);
          setRewards([]);
        }
      });
    }
  }, []);

  // Load contract instance
  const loadContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = getContract(signer);
    setContract(contractInstance);
    fetchRewards(contractInstance);
  };

  // Add reward function
  const handleAddReward = async () => {
    if (!contract) return;
    if (!rewardName || !rewardPoints) {
      alert('Please enter reward name and points');
      return;
    }
    try {
      const tx = await contract.addReward(rewardName, parseInt(rewardPoints));
      await tx.wait();
      fetchRewards(contract);
      setRewardName('');
      setRewardPoints('');
    } catch (err) {
      console.error('Error adding reward:', err);
    }
  };

  // Fetch rewards
  const fetchRewards = async (contractInstance) => {
    try {
      const count = await contractInstance.getRewardCount();
      const rewardsArray = [];

      for (let i = 0; i < count; i++) {
        const reward = await contractInstance.getReward(i);
        rewardsArray.push({ name: reward[0], points: reward[1].toString() });
      }

      setRewards(rewardsArray);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>🎁 Blockchain Reward System</h1>

      <button onClick={connectWallet}>🔌 Connect Wallet</button>

      {walletAddress && (
        <>
          <p>✅ Connected: <b>{walletAddress}</b></p>

          <div>
            <input
              type="text"
              placeholder="Reward Name"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Points"
              value={rewardPoints}
              onChange={(e) => setRewardPoints(e.target.value)}
            />
            <button onClick={handleAddReward}>Add Reward</button>
          </div>

          <h3>📋 Rewards List:</h3>
          <ul>
            {rewards.map((r, i) => (
              <li key={i}>
                {r.name} — {r.points} points
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
