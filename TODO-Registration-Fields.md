# TODO: Bring Frontend Registration Fields to Mobile App

## Overview
Enhance the mobile app registration screen to match the frontend's multi-step registration process, including role selection and agent-specific fields.

## Current State
- Mobile app has basic registration: firstName, lastName, email, phone, password, confirmPassword
- Frontend has multi-step process with roles (user/agent) and additional agent fields

## Required Changes
- [ ] Add role selection (User/Agent)
- [ ] Add agent-specific fields: businessName, registrationNumber, yearsOfExperience, bankName, accountNumber
- [ ] Implement multi-step form or expand single screen
- [ ] Update form validation
- [ ] Update registration API call to include new fields
- [ ] Test registration flow

## Files to Edit
- mobile-app/src/screens/RegistrationScreen.js

## Testing
- Test user registration
- Test agent registration with all fields
- Verify API integration
