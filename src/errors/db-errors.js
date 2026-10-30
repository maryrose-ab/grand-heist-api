// Reads the name of the database constraint that an insert, update or delete broke.
// Returns null when the error is not a constraint violation.
const {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
} = require('sequelize');

// PostgreSQL codes: 23505 unique, 23503 foreign key, 23001 RESTRICT.
// A foreign key declared with onDelete RESTRICT reports 23001, and
// Sequelize does not turn that one into a ForeignKeyConstraintError.
const CONSTRAINT_CODES = ['23505', '23503', '23001'];

function constraintOf(error) {
  if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
    return (error.parent && error.parent.constraint) || error.index || 'unknown';
  }
  const code = error && error.parent && error.parent.code;
  if (error instanceof DatabaseError && CONSTRAINT_CODES.includes(code)) {
    return error.parent.constraint || 'unknown';
  }
  return null;
}

module.exports = { constraintOf };