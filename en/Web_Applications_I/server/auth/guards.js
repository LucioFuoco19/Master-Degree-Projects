//verifica se l'utente si è loggato o meno
export function isLoggedIn(req, res, next) { //req=chi fa richiesta, res=responso, next=prossima funzione nel middleware
  if (req.isAuthenticated()) return next(); //isAuthenticated() funzione offerta da passport.js e assegnataa req

  // Logout forced in case of invalid session
  req.logout(err => {
    if (err) console.error('Error during logout:', err);
    req.session.destroy(() => { //distruggi la sessione
      res.clearCookie('connect.sid'); /* rimuove il cookie "connect.sid"(chiamato così in default da espress) 
      dal browser del client */
      return res.status(401).json({ error: 'Session expired. Re-do login.' }); //restituisce unauthorized
    });
  });
}

export function isTeacher(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'teacher') return next();
  req.logout(err => {
    if (err) console.error('Error during logout:', err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.status(401).json({ error: 'Only teachers have access. Invalid session.' });
    });
  });
}

export function isStudent(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'student') return next();

  req.logout(err => {
    if (err) console.error('Error during logout:', err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.status(401).json({ error: 'Only students have access. Invalid session.' });
    });
  });
}
