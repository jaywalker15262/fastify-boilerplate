/*export const userBaseSchema = `
    email: String!
    country: String!
    postalCode: String!
    street: String!
`;*/
export const userBaseSchema = `
    email: String!
`;

const userSchema = `

  enum UserRole {
    admin
    moderator
    guest
  }

  type User {
    id: ID!
    role: UserRole!
    ${userBaseSchema}
  }

`;

export default userSchema;
