// demande à l'IA de jouer
function iaJoue(grilleOrig, couleur) {
	return iaAlphaBeta(copieGrille(grilleOrig), couleur, 0, -Infinity, Infinity);
}

// fonction gérant l'algorithme minimax et l'élagage alpha-beta
function iaAlphaBeta(grille, couleur, profondeur, alpha, beta){
	if (profondeur === iaProfondeurMax) {
		// on a atteint la limite de profondeur de calcul on retourne donc une estimation de la position actuelle
		if (couleur === 1) {
			return iaEstimation(grille);
		} else {
			return -iaEstimation(grille);
		}
	} else {
		var meilleur = -Infinity; 		// estimation du meilleur coup actuel
		var estim; 						// estimation de la valeur d'un coup
		var coup = null; 				// meilleur coup actuel
		var couleurOpp = couleur%2+1; 	// optimisation pour calculer la couleur adverse

		// on va essayer toutes les combinaisons possibles
		for (var x = 0; x < nx; x++) {
			for (var y = 0; y < ny; y++) {
				if (grille[x][y]) {
					// case déjà occupée
					continue;
				}

				if (!coup) {
					// Pour proposer au moins un coup
					coup=[x,y];
				}

				grille[x][y] = couleur; // On va essayer avec ce coup
				// vérifie si le coup est gagnant
				if (estim = checkWinner(x, y, grille)) {
					grille[x][y] = 0; //restauration de la grille
					if (!profondeur) {
						return [x,y];
					} 
					return Infinity;
				}
				estim = -iaAlphaBeta(grille, couleurOpp, profondeur+1, -beta, -alpha); // on calcule la valeur de ce coup

				if (estim > meilleur) {
					// on vient de trouver un meilleur coup
					meilleur = estim;
					if (meilleur > alpha) {
						alpha = meilleur;
						coup = [x,y];
						if (alpha >= beta) {
							/*ce coup est mieux que le meilleur des coups qui aurait pu être joué si on avait joué un autre
							coup. Cela signifie que jouer le coup qui a amené cette position n'est pas bon. Il est inutile
							de continuer à estimer les autres possibilités de cette position (principe de l'élagage alpha-beta). */
							grille[x][y]=0; //restauration de la grille
							if (!profondeur) {
								return coup;
							}
							return meilleur;
						}
					}
				}
				grille[x][y] = 0; //restauration de la grille
			}
		}
		if (!profondeur) {
			return coup;
		}
		else if (coup) {
			return meilleur;
		}
		return 0; // si coup n'a jamais été défini c'est qu'il n'y a plus de possibilité de jeu. C'est partie nulle.
	}
}


// permet d'estimer la position
function iaEstimation(grille) {
	var estimation = 0; // Estimation globale de la position
	for (var x = 0; x < nx; x++) {
		for (var y = 0; y < ny; y++) {
			if (!grille[x][y]) continue;
			// Estimation de la valeur de ce jeton et ajout au calcul d'estimation global
			switch (grille[x][y]) {
				case 1:
					estimation += iaAnalyse(grille, x, y);
					break;
				case 2: 
					estimation -= iaAnalyse(grille, x, y);
					break;
			}
		}
	}
	return estimation;
}

// permet de calculer le nombre de "libertés" pour la case donnée
function iaAnalyse(grille,x,y) {
	var couleur = grille[x][y];
	var estimation = 0; // estimation pour toutes les directions
	var compteur = 0; 	// compte le nombre de possibilités pour une direction
	var centre = 0; 	// regarde si le jeton a de l'espace de chaque côté
	var bonus = 0; 		// point bonus liée aux jetons alliés dans cette même direction
	var i,j; 			// pour les coordonnées temporaires
	var pass = false; 	// permet de voir si on a passé la case étudiée
	var pLiberte = 1; 	// pondération sur le nombre de liberté
	var pBonus = 1; 	// pondération Bonus
	var pCentre = 2; 	// pondération pour l'espace situé de chaque côté

	// Recherche horizontale
	for (i = 0; i < nx; i++) {
		if (i == x) {
			centre = compteur++;
			pass = true;
			continue;
		}
		switch (grille[i][y]) {
			case 0: // case vide
				compteur++;
				break;
			case couleur: // jeton allié
				compteur++;
				bonus++;
				break;
			default: // jeton adverse
				if (pass) {
					i = nx; //il n'y aura plus de liberté supplémentaire, on arrête la recherche ici
				} else {
					// on réinitialise la recherche
					compteur = 0;
					bonus = 0;
				}
		}
	}
	if (compteur >= nbAligne) {
		// il est possible de gagner dans cette direction
		estimation += compteur*pLiberte + bonus*pBonus + (1-Math.abs(centre/(compteur-1)-0.5))*compteur*pCentre;
	}

	// Recherche verticale
	compteur = 0;
	bonus = 0;
	pass = false;
	for (j = 0; j < ny; j++) {
		if (j == y) {
			centre = compteur++;
			pass = true;
			continue;
		}
		switch (grille[x][j]) {
			case 0: // case vide
				compteur++;
				break;
			case couleur: // jeton allié
				compteur++;
				bonus++;
				break;
			default: // jeton adverse
				if (pass) {
					j = ny; // il n'y aura plus de liberté supplémentaire, on arrête la recherche ici
				} else {
					// on réinitialise la recherche
					compteur = 0;
					bonus = 0;
				}
		}
	}
	if (compteur >= nbAligne) {
		// il est possible de gagner dans cette direction
		estimation += compteur*pLiberte + bonus*pBonus + (1-Math.abs(centre/(compteur-1)-0.5))*compteur*pCentre;
	}

	// Recherche diagonale (NO-SE)
	compteur = 0;
	bonus = 0;
	i = x;
	j = y;
	while (i-->0 && j-->0) {
		switch (grille[i][j]) {
			case 0: // case vide
				compteur++;
				break;
			case couleur: // jeton allié
				compteur++;
				bonus++;
				break;
			default: // jeton adverse, on arrête de rechercher
				i = 0;
		}
	}
	centre = compteur++;
	i = x;
	j = y;
	while (++i<nx && ++j<ny) {
		switch (grille[i][j]) {
			case 0: // case vide
				compteur++;
				break;
			case couleur: // jeton allié
				compteur++;
				bonus++;
				break;
			default: // jeton adverse, on arrête de rechercher
				i = nx;
		}
	}
	if (compteur >= nbAligne) {
		// il est possible de gagner dans cette direction
		estimation += compteur*pLiberte + bonus*pBonus + (1-Math.abs(centre/(compteur-1)-0.5))*compteur*pCentre;
	}

	// Recherche diagonale (NE-SO)
	compteur = 0;
	bonus = 0;
	i = x;
	j = y;
	while (i-->0 && ++j<ny) {
		switch (grille[i][j]) {
			case 0: // case vide
				compteur++;
				break;
			case couleur: // jeton allié
				compteur++;
				bonus++;
				break;
			default: // jeton adverse, on arrête de rechercher
				i = 0;
		}
	}
	centre = compteur++;
	i = x;
	j = y;
	while (++i<nx && j-->0) {
		switch (grille[i][j]) {
			case 0: // case vide
				compteur++;
				break;
			case couleur: // jeton allié
				compteur++;
				bonus++;
				break;
			default: // jeton adverse, on arrête de rechercher
				i = nx;
		}
	}
	if (compteur >= nbAligne) {
		// il est possible de gagner dans cette direction
		estimation += compteur*pLiberte + bonus*pBonus + (1-Math.abs(centre/(compteur-1)-0.5))*compteur*pCentre;
	}

	return estimation;
}

// permet de copier une grille, cela permet d'éviter de modifier par inadvertance la grille de jeu originale
function copieGrille(grille) {
	var nvGrille = [];
	for (var x = 0; x < nx; x++) {
		nvGrille[x] = grille[x].concat([]); // effectue une copie de la liste
	}
	return nvGrille;
}