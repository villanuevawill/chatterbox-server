//YOU DO NOT NEED TO EDIT this code.
if (!/(&|\?)username=/.test(window.location.search)) {
  window.location.username = (prompt('What is your name?') || 'anonymous');
}
