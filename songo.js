// ============================================================
//  SONGO — Classes POO  (Brique 2)
//  Structure : Case → Plateau → Joueur → Jeu
// ============================================================


// ------------------------------------------------------------
// CLASSE Case
// Représente une case du plateau.
// Une case appartient à un joueur (1 ou 2) et a un numéro (1 à 7).
// Elle contient un certain nombre de graines.
// ------------------------------------------------------------
class Case {
  constructor(joueur, numero) {
    this.joueur  = joueur;   // 1 = SUD, 2 = NORD
    this.numero  = numero;   // 1 à 7
    this.graines = 5;        // 5 graines en début de partie
  }

  // Vide la case et retourne les graines ramassées
  ramasser() {
    const quantite = this.graines;
    this.graines = 0;
    return quantite;
  }

  // Dépose une graine dans la case
  deposer() {
    this.graines++;
  }

  // Indique si la case est vide
  estVide() {
    return this.graines === 0;
  }

  // Indique si la case remplit la condition de prise (1 à 3 graines AVANT dépôt,
  // ce qui donne 2 à 4 après la dernière graine déposée)
  estPrêtePrise() {
    return this.graines >= 2 && this.graines <= 4;
  }

  toString() {
    return `Case(J${this.joueur}, n°${this.numero}, ${this.graines} graines)`;
  }
}


// ------------------------------------------------------------
// CLASSE Plateau
// Contient les 14 cases (7 par joueur) et gère la navigation.
// La règle de navigation est : toujours vers la case 7,
// dans son camp comme dans celui de l'adversaire.
// ------------------------------------------------------------
class Plateau {
  constructor() {
    // On crée 7 cases pour chaque joueur, numérotées 1 à 7
    this.casesJ1 = Array.from({ length: 7 }, (_, i) => new Case(1, i + 1));
    this.casesJ2 = Array.from({ length: 7 }, (_, i) => new Case(2, i + 1));
  }

  // Retourne les cases d'un joueur donné
  getCases(joueur) {
    return joueur === 1 ? this.casesJ1 : this.casesJ2;
  }

  // Retourne une case précise par joueur et numéro
  getCase(joueur, numero) {
    return this.getCases(joueur)[numero - 1];
  }

  // Retourne le nombre total de graines dans le camp d'un joueur
  totalGraines(joueur) {
    return this.getCases(joueur).reduce((sum, c) => sum + c.graines, 0);
  }

  // Vérifie si tout le camp d'un joueur est vide
  campVide(joueur) {
    return this.totalGraines(joueur) === 0;
  }

  // -------------------------------------------------------
  // NAVIGATION — cœur du plateau
  // Retourne la séquence ordonnée de cases à parcourir
  // à partir d'une case de départ (exclue), en allant
  // toujours vers la case 7, puis vers la 7 adverse, en boucle.
  //
  // joueurCourant : le joueur qui joue (1 ou 2)
  // caseDepart    : la Case d'où on a ramassé les graines
  // nbGraines     : nombre de graines à distribuer
  //                 (sert à savoir combien de cases générer)
  // -------------------------------------------------------
  getSequenceDistribution(joueurCourant, caseDepart, nbGraines) {
    const sequence = [];
    let campActuel = joueurCourant;   // on commence dans son propre camp
    let numero     = caseDepart.numero + 1; // on part de la case suivante

    // On génère autant de cases que de graines à distribuer
    // (chaque case reçoit exactement 1 graine)
    while (sequence.length < nbGraines) {

      if (numero <= 7) {
        // La case existe dans ce camp, on l'ajoute
        // SAUF si c'est la case de départ qu'on doit sauter
        // (uniquement lors d'un tour complet, géré dans Jeu)
        sequence.push(this.getCase(campActuel, numero));
        numero++;

      } else {
        // On a dépassé la case 7 : on change de camp et on repart de la case 1
        campActuel = campActuel === 1 ? 2 : 1;
        numero = 1;
        // On ajoute la case 1 du nouveau camp
        sequence.push(this.getCase(campActuel, numero));
        numero++;
      }
    }

    return sequence;
  }

  // Retourne le nombre total de graines sur tout le plateau
  totalGeneral() {
    return this.totalGraines(1) + this.totalGraines(2);
  }

  // Réinitialise le plateau (nouvelle partie)
  reinitialiser() {
    [...this.casesJ1, ...this.casesJ2].forEach(c => c.graines = 5);
  }
}


// ------------------------------------------------------------
// CLASSE Joueur
// Représente un joueur : son identifiant, son nom,
// et ses graines capturées.
// ------------------------------------------------------------
class Joueur {
  constructor(id, nom) {
    this.id      = id;    // 1 ou 2
    this.nom     = nom;   // ex: "Joueur 1"
    this.capture = 0;     // graines récoltées au fil de la partie
  }

  // Ajoute des graines capturées au score
  ajouterCapture(nb) {
    this.capture += nb;
  }

  // Indique si le joueur a gagné (≥ 40 graines)
  aGagne() {
    return this.capture >= 40;
  }

  // Remet le joueur à zéro (nouvelle partie)
  reinitialiser() {
    this.capture = 0;
  }

  toString() {
    return `${this.nom} — ${this.capture} graines capturées`;
  }
}


// ------------------------------------------------------------
// CLASSE Jeu
// Orchestre la partie : tours, semaille, prises, règles spéciales.
// C'est ici que toute la logique du Songo sera implémentée.
// Pour l'instant : initialisation + sélection de case.
// La semaille sera ajoutée en Brique 4.
// ------------------------------------------------------------
class Jeu {
  constructor(nomJ1 = "Joueur 1", nomJ2 = "Joueur 2") {
    this.plateau  = new Plateau();
    this.joueurs  = [new Joueur(1, nomJ1), new Joueur(2, nomJ2)];
    this.tourActuel = 1;      // commence avec le joueur 1
    this.partieTerminee = false;
    this.messageEtat = `${nomJ1} commence. Choisissez une case.`;
  }

  // Retourne l'objet Joueur dont c'est le tour
  getJoueurActuel() {
    return this.joueurs[this.tourActuel - 1];
  }

  // Retourne l'adversaire du joueur courant
  getAdversaire() {
    return this.joueurs[this.tourActuel === 1 ? 1 : 0];
  }

  // Passe la main à l'autre joueur
  passerLaTour() {
    this.tourActuel = this.tourActuel === 1 ? 2 : 1;
  }

  // Vérifie si une case est jouable par le joueur courant
  // (appartient à son camp et n'est pas vide)
  caseJouable(joueur, numeroCase) {
    if (joueur !== this.tourActuel) return false;
    const c = this.plateau.getCase(joueur, numeroCase);
    return !c.estVide();
  }

  // Point d'entrée principal : le joueur clique sur une case
  // Retourne false si le coup est invalide
  jouerCoup(numeroCase) {
    if (this.partieTerminee) return false;

    const joueur     = this.tourActuel;
    const adversaire = joueur === 1 ? 2 : 1;
    const caseChoisie = this.plateau.getCase(joueur, numeroCase);

    if (caseChoisie.estVide()) {
      this.messageEtat = "Case vide. Choisissez une autre case.";
      return false;
    }

    // Brique 6a — vérifier la règle de solidarité AVANT de jouer
    if (this.plateau.campVide(adversaire)) {
      const coupValide = this._verifierSolidarite(numeroCase);
      if (!coupValide) {
        this.messageEtat = "Ce coup n'alimente pas assez le camp adverse. Choisissez une autre case.";
        return false;
      }
    }

    // Brique 4 : semaille
    const dernierCase = this._semer(caseChoisie);

    // Brique 6b — interdit case 7 : si on vient de jouer la case 7,
    // et que seulement 1 ou 2 graines sont arrivées chez l'adversaire,
    // ces graines lui sont données directement (pas distribuées)
    if (numeroCase === 7) {
      this._appliquerInterditCase7(joueur, adversaire);
    }

    // Brique 5 : prises
    const grainesCapturees = this._effectuerPrises(dernierCase);

    // Brique 6c — vérifier fin de partie AVANT de passer le tour
    // pour que les scores soient à jour au moment du test
    const joueurQuiVientDeJouer = this.joueurs[joueur - 1];
    let msg = `${joueurQuiVientDeJouer.nom} a joué.`;
    if (grainesCapturees > 0) {
      msg += ` Prise de ${grainesCapturees} graine(s) !`;
    }

    this.passerLaTour();
    const finPartie = this._verifierFinDePartie();

    if (!finPartie) {
      msg += ` — ${this.getJoueurActuel().nom}, à vous.`;
    }
    this.messageEtat = finPartie ? this.messageEtat : msg;

    return true;
  }

  // ------------------------------------------------------------
  // _effectuerPrises(dernierCase)
  // Vérifie si la dernière case touchée déclenche une prise,
  // puis remonte la chaîne tant que la condition est remplie.
  // Retourne le nombre total de graines capturées.
  // ------------------------------------------------------------
  _effectuerPrises(dernierCase) {
    if (!dernierCase) return 0;

    const joueur     = this.tourActuel;
    const adversaire = joueur === 1 ? 2 : 1;

    // La prise ne se fait que dans le camp adverse
    if (dernierCase.joueur !== adversaire) return 0;

    // Construire la liste des cases à potentiellement capturer
    // en remontant depuis la dernière case vers la case 1 adverse
    const casesAPrendre = [];
    let numero = dernierCase.numero;

    while (numero >= 1) {
      const c = this.plateau.getCase(adversaire, numero);

      // Cas spécial : case 1 adverse
      if (numero === 1) {
        // La prise normale (2-4) ne s'applique PAS sur la case 1
        // SAUF si elle est incluse dans une chaîne déjà commencée
        if (casesAPrendre.length > 0 && c.graines >= 2 && c.graines <= 4) {
          casesAPrendre.push(c);
        }
        break; // on s'arrête dans tous les cas après la case 1
      }

      // Condition de prise normale : 2 à 4 graines
      if (c.graines >= 2 && c.graines <= 4) {
        casesAPrendre.push(c);
        numero--; // on remonte vers la case 1
      } else {
        break; // la chaîne est rompue
      }
    }

    if (casesAPrendre.length === 0) return 0;

    // Vérifier l'interdit : on ne peut pas vider complètement le camp adverse
    const totalAdverse = this.plateau.totalGraines(adversaire);
    const totalAPrendre = casesAPrendre.reduce((sum, c) => sum + c.graines, 0);

    if (totalAPrendre >= totalAdverse) {
      // La prise viderait tout le camp → aucune prise
      return 0;
    }

    // Effectuer les prises
    let totalCapture = 0;
    for (const c of casesAPrendre) {
      totalCapture += c.graines;
      c.graines = 0;
    }

    // Créditer le joueur qui a joué (pas le joueur actuel, car on a déjà passé le tour)
    this.joueurs[joueur - 1].ajouterCapture(totalCapture);

    return totalCapture;
  }

  // ------------------------------------------------------------
  // _semer(caseChoisie)
  // Ramasse les graines de caseChoisie et les distribue une à une
  // en suivant la règle : toujours vers la case 7, dans son camp
  // puis dans le camp adverse, en boucle.
  //
  // Retourne la dernière Case touchée (utile pour les prises).
  // ------------------------------------------------------------
  _semer(caseChoisie) {
    const joueur    = this.tourActuel;
    const adversaire = joueur === 1 ? 2 : 1;

    // Mémoriser les graines de la case 7 avant ramassage (pour l'interdit case 7)
    if (caseChoisie.numero === 7) {
      this._derniereCase7Graines = caseChoisie.graines;
    }

    // 1. Ramasser toutes les graines de la case choisie
    let nbGraines = caseChoisie.ramasser();

    // 2. Construire la séquence de distribution
    let sequence;

    if (nbGraines > 13) {
      // ── Cas spécial : tour complet ──────────────────────────
      // On distribue dans toutes les cases SAUF la case de départ.
      // Après avoir franchi le camp adverse une première fois,
      // on continue EXCLUSIVEMENT dans le camp adverse
      // depuis sa case 1 jusqu'à épuisement.

      sequence = this._sequenceTourComplet(caseChoisie, nbGraines, joueur, adversaire);

    } else {
      // ── Cas normal : ≤ 13 graines ──────────────────────────
      sequence = this.plateau.getSequenceDistribution(joueur, caseChoisie, nbGraines);
    }

    // 3. Distribuer : une graine par case dans l'ordre
    let dernierCase = null;
    for (const c of sequence) {
      c.deposer();
      dernierCase = c;
    }

    return dernierCase;
  }

  // ------------------------------------------------------------
  // _sequenceTourComplet(caseDepart, nbGraines, joueur, adversaire)
  // Génère la séquence pour le cas > 13 graines :
  // - On fait un tour complet en sautant la case de départ
  // - Dès qu'on atteint le camp adverse pour la première fois,
  //   on y reste jusqu'à épuisement des graines (en repartant
  //   de la case 1 adverse si nécessaire)
  // ------------------------------------------------------------
  _sequenceTourComplet(caseDepart, nbGraines, joueur, adversaire) {
    const sequence = [];
    let grainесRestantes = nbGraines;

    // Phase 1 : tour complet en sautant la case de départ
    // On part de la case suivante dans le camp du joueur
    let campActuel = joueur;
    let numero     = caseDepart.numero + 1;
    let tourFranchie = false; // devient true dès qu'on entre dans le camp adverse

    while (!tourFranchie) {
      if (numero <= 7) {
        const c = this.plateau.getCase(campActuel, numero);
        sequence.push(c);
        grainесRestantes--;
        numero++;
      } else {
        // Franchissement de camp
        campActuel = campActuel === joueur ? adversaire : joueur;
        numero = 1;

        if (campActuel === adversaire) {
          // On vient d'entrer dans le camp adverse → fin de la phase 1
          tourFranchie = true;
        }
      }
    }

    // Phase 2 : distribuer exclusivement dans le camp adverse
    // depuis la case 1, en repartant de 1 si on dépasse la 7
    numero = 1;
    while (grainесRestantes > 0) {
      if (numero > 7) numero = 1; // repart de la case 1 adverse
      const c = this.plateau.getCase(adversaire, numero);
      sequence.push(c);
      grainесRestantes--;
      numero++;
    }

    return sequence;
  }

  // Retourne un snapshot de l'état pour l'affichage UI
  getEtat() {
    return {
      casesJ1    : this.plateau.casesJ1.map(c => ({ numero: c.numero, graines: c.graines })),
      casesJ2    : this.plateau.casesJ2.map(c => ({ numero: c.numero, graines: c.graines })),
      scoreJ1    : this.joueurs[0].capture,
      scoreJ2    : this.joueurs[1].capture,
      totalJeu   : this.plateau.totalGeneral(),
      tour       : this.tourActuel,
      message    : this.messageEtat,
      termine    : this.partieTerminee
    };
  }

  // Nouvelle partie
  reinitialiser() {
    this.plateau.reinitialiser();
    this.joueurs.forEach(j => j.reinitialiser());
    this.tourActuel = 1;
    this.partieTerminee = false;
    this.messageEtat = `${this.joueurs[0].nom} commence. Choisissez une case.`;
  }
  // ============================================================
  // BRIQUE 6 — Règles spéciales
  // ============================================================

  // ------------------------------------------------------------
  // _verifierSolidarite(numeroCase)
  // Appelée quand le camp adverse est vide.
  // Vérifie si le coup choisi envoie au moins 7 graines
  // dans le camp adverse.
  // Si aucun coup du joueur ne peut envoyer 7 graines,
  // on accepte le coup qui envoie le maximum possible.
  // Retourne true si le coup est autorisé, false sinon.
  // ------------------------------------------------------------
  _verifierSolidarite(numeroCase) {
    const joueur     = this.tourActuel;
    const adversaire = joueur === 1 ? 2 : 1;

    // Calculer combien de graines le coup enverrait dans le camp adverse
    const grainesVersAdverse = this._simulerGrainesVersAdverse(joueur, numeroCase);

    // Chercher si un coup peut envoyer >= 7 graines
    let maxPossible = 0;
    for (let n = 1; n <= 7; n++) {
      const c = this.plateau.getCase(joueur, n);
      if (!c.estVide()) {
        const g = this._simulerGrainesVersAdverse(joueur, n);
        if (g > maxPossible) maxPossible = g;
      }
    }

    if (maxPossible >= 7) {
      // Un coup à 7+ existe : le joueur doit le jouer
      return grainesVersAdverse >= 7;
    } else {
      // Aucun coup ne peut envoyer 7 : on accepte le coup
      // qui envoie le maximum possible
      return grainesVersAdverse >= maxPossible;
    }
  }

  // ------------------------------------------------------------
  // _simulerGrainesVersAdverse(joueur, numeroCase)
  // Simule la distribution sans modifier le plateau,
  // et retourne combien de graines atterriraient dans le camp adverse.
  // ------------------------------------------------------------
  _simulerGrainesVersAdverse(joueur, numeroCase) {
    const adversaire  = joueur === 1 ? 2 : 1;
    const caseDepart  = this.plateau.getCase(joueur, numeroCase);
    const nbGraines   = caseDepart.graines;
    if (nbGraines === 0) return 0;

    // Générer la séquence de distribution (sans modifier le plateau)
    let sequence;
    if (nbGraines > 13) {
      sequence = this._sequenceTourComplet(caseDepart, nbGraines, joueur, adversaire);
    } else {
      sequence = this.plateau.getSequenceDistribution(joueur, caseDepart, nbGraines);
    }

    // Compter les cases qui appartiennent au camp adverse
    return sequence.filter(c => c.joueur === adversaire).length;
  }

  // ------------------------------------------------------------
  // _appliquerInterditCase7(joueur, adversaire)
  // Si la case 7 a été jouée et qu'elle n'a envoyé que 1 ou 2
  // graines chez l'adversaire, ces graines lui sont données
  // directement sans distribution.
  // ------------------------------------------------------------
  _appliquerInterditCase7(joueur, adversaire) {
    // Compter les graines qui viennent d'arriver dans le camp adverse
    // Ce sont les graines dans les cases 1 et 2 adverses qui viennent d'être touchées
    // On détecte via la simulation : si la case 7 du joueur n'envoie que 1 ou 2 graines
    // côté adverse, on les transfère au score de l'adversaire

    // Recalculer combien de graines sont arrivées dans le camp adverse
    // après la semaille (on ne peut plus simuler, la semaille est faite)
    // On utilise une approche différente : on vérifie si la case 7 avait
    // initialement 1 ou 2 graines (car si elle en avait 1 → 1 graine adverse,
    // si elle en avait 2 → 2 graines adverses, si ≥ 3 → au moins 3 donc pas d'interdit)

    // Note : à ce stade la semaille est déjà effectuée.
    // On repère les graines en cases 1 et/ou 2 adverses qui viennent
    // d'y être déposées en vérifiant l'état actuel.
    // La règle dit : si ≤ 2 graines envoyées en camp adverse depuis case 7,
    // elles reviennent à l'adversaire.

    // On a besoin de savoir combien de graines la case 7 avait AVANT la semaille.
    // On utilise this._derniereCase7Graines stocké juste avant la semaille.
    const nbInitial = this._derniereCase7Graines || 0;

    if (nbInitial === 1 || nbInitial === 2) {
      // Les graines arrivent forcément en cases 1 (et 2) adverses
      let grainesRecuperees = 0;
      for (let n = 1; n <= nbInitial; n++) {
        const c = this.plateau.getCase(adversaire, n);
        if (c.graines > 0) {
          grainesRecuperees += nbInitial;
          c.graines -= nbInitial;
          break;
        }
      }
      // Ces graines vont directement à l'adversaire
      if (grainesRecuperees > 0) {
        this.joueurs[adversaire - 1].ajouterCapture(grainesRecuperees);
      }
    }
    this._derniereCase7Graines = 0;
  }

  // ------------------------------------------------------------
  // _verifierFinDePartie()
  // Vérifie les 3 conditions de fin après chaque coup.
  // Retourne true si la partie est terminée.
  // ------------------------------------------------------------
  _verifierFinDePartie() {
    const j1 = this.joueurs[0];
    const j2 = this.joueurs[1];

    // Condition 1 : un joueur a >= 40 graines
    if (j1.aGagne() || j2.aGagne()) {
      this.partieTerminee = true;
      const gagnant = j1.aGagne() ? j1 : j2;
      this.messageEtat = `🎉 ${gagnant.nom} remporte la partie avec ${gagnant.capture} graines !`;
      return true;
    }

    // Condition 2 : moins de 10 graines en jeu
    if (this.plateau.totalGeneral() < 10) {
      this.partieTerminee = true;
      // Les graines restantes reviennent au propriétaire du camp
      this.plateau.casesJ1.forEach(c => { j1.ajouterCapture(c.graines); c.graines = 0; });
      this.plateau.casesJ2.forEach(c => { j2.ajouterCapture(c.graines); c.graines = 0; });
      const msg = this._messageResultatFinal();
      this.messageEtat = msg;
      return true;
    }

    // Condition 3 : solidarité impossible
    // Le camp du joueur actuel est vide ET son adversaire
    // ne peut envoyer aucune graine dans son camp
    const joueurActuel = this.tourActuel;
    const adversaire   = joueurActuel === 1 ? 2 : 1;

    if (this.plateau.campVide(joueurActuel)) {
      // Vérifier si l'adversaire peut envoyer des graines
      let peutAider = false;
      for (let n = 1; n <= 7; n++) {
        const c = this.plateau.getCase(adversaire, n);
        if (!c.estVide()) {
          const g = this._simulerGrainesVersAdverse(adversaire, n);
          if (g > 0) { peutAider = true; break; }
        }
      }

      if (!peutAider) {
        this.partieTerminee = true;
        // Les graines restantes reviennent à leur propriétaire
        this.plateau.casesJ1.forEach(c => { j1.ajouterCapture(c.graines); c.graines = 0; });
        this.plateau.casesJ2.forEach(c => { j2.ajouterCapture(c.graines); c.graines = 0; });
        const msg = this._messageResultatFinal();
        this.messageEtat = msg;
        return true;
      }
    }

    return false;
  }

  // ------------------------------------------------------------
  // _messageResultatFinal()
  // Construit le message de fin de partie selon les scores.
  // ------------------------------------------------------------
  _messageResultatFinal() {
    const j1 = this.joueurs[0];
    const j2 = this.joueurs[1];
    if (j1.capture === j2.capture) {
      return `Partie nulle ! ${j1.capture} graines chacun.`;
    }
    const gagnant = j1.capture > j2.capture ? j1 : j2;
    return `🎉 ${gagnant.nom} remporte la partie avec ${gagnant.capture} graines !`;
  }
}