# Golem DB Console

## Overview

## Golem DB Console

Golem DB Console provides Supabase-like interface and abstraction layer for the Golem DB.

Included dapp allows for:

- Creating `Collections` with objects belonging to those collections

- `Schemas` for structured data types per collections with JSON.validation, property types, primary unique values, automated optional autoincrement for primary values.

- User Interface for querying data by type, inspecting objects in collections and schemas.

User Journer:

- Fill out config in settings(wallet, RPC, chain ID etc)

- Connect to network

- Create Collections

​- Define schemas per collections

- Insert objects into collection based on previously defined schemas

​- Inspect Collections

- Query individual objects data based on annotations

​Limitations:

Currently the user has to manually input development private key for wallet with gollem db testnet tokens because of golem db sdk limitations.

## Symbiotic

Symbiotic integration is a fork of sum task example. It is being used for access control and allows automatic cross-chain verification of NFT ownership to verify if specified user currently owns NFT on other chain

#symbiotic
