# Blizzard

A program to find and submit atomic arbitrage opportunities on the Avalanche blockchain. The associated contracts can be found [here](https://github.com/nikhil1231/Icicle). This project was mainly used as a learning experience, and as such is not fully optimised and will probably not be profitable. Also note that this project was built from scratch, not referencing anything like [the flashbots arb example](https://github.com/flashbots/simple-arbitrage).

Ultimately, the final nail in the coffin for this project in terms of profitability was that the MEV space on Avalanche is dominated by validators, something I only found out about after trying out my code. Given the high barrier to entry to become a validator, I ended the project here. Perhaps I could start it back up if something like Flashbots becomes available on Avalanche.

## Potential optimizations
### Running a client
By running a client, you get quicker access to incoming transactions, and can act on them faster.

### Switching from gradient descent to binary search
Something I only realised after looking at the flashbots repo, using binary search instead of gradient descent to find the optimal arb amount would be much simpler.
