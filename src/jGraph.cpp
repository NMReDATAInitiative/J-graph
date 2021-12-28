#include "jGraph.h"
#include <algorithm>
#include <cmath>
#include <iostream> // remove with std::cout and std::endl

JGraph::JGraph() {
}

bool JGraph::hasJ(size_t first, size_t second, double &currentJ, double &currentShiftedJ) { 
for (size_t index = 0; index < fColumns[first].columnMembers.size(); index++) {
	if (fColumns[first].columnMembers[index].hasPartnerIndex) {
		if (fColumns[first].columnMembers[index].partnerIndex == second) {
			currentJ = fColumns[first].columnMembers[index].Jvalues;
			currentShiftedJ = fColumns[first].columnMembers[index].shiftedJvalues;
			return true;
		}
	}
}
return false;
}

void JGraph::updateShiftedPositions() {
/*
The middle segment should drawn at a level corresponding to Jmodif(a,b). The Jmodif(a,b) is 
initially set to J(a,b) and imbricated loops will increment Jmodif according to the desired space. 
This space may be just the width of the horizontal lines plus some margin for readability or more 
if the value of the coupling or other text is added on the lines.
Loop 1: Loop over increasing spaced pairs of pillars a and b. Start with 
abs(PillarIndex(a) - PillarIndex(b)) == 2 (one pillar between a and b) and increment until 
abs(PillarIndex(a) - PillarIndex(b)) == PillarIndex.size() - 1.

Loop 2: Loop j over increasing values of coupling of pillar i between a and b. (Sort all J’s 
found between a and b by increasing value.)

If a value of Jmodif(a, b) is close to Jmodif(i, a) or J(i, a) : increment Jmodif(a, b). 
This will ensure the horizontal line will touch neither the dots nor the horizontal lines 
located between a and b.
*/

const size_t lastColuNumber = fColumns.size() - 1;
for (size_t diffIndex = 2; diffIndex < lastColuNumber ; diffIndex++) {
	const size_t lastColGigenDiffIndex = lastColuNumber - diffIndex;
	for (size_t curCol = 0; curCol <= lastColGigenDiffIndex; curCol ++ ) {
		const size_t first = curCol;
		const size_t second = curCol + diffIndex;
	//	double currentShiftedJlast = 0.0;
		double currentShiftedJ = 0.0;
		double currentJ = 0.0;
		if (hasJ(first, second, currentJ, currentShiftedJ)) {
		//	while (abs(currentShiftedJlast - currentShiftedJ) > 0.01) {
		//		currentShiftedJlast = currentShiftedJ	;
		//	}
			// see if any dot is too close
			vector < double > listJ; 
			for (size_t inside = first + 1; inside <= second - 1; inside ++) {
				for (auto it : this->fColumns[inside].columnMembers) {
					if (it.Jvalues >  (currentJ - fDeltaDot)) {
						listJ.push_back(it.Jvalues);
					}
				}
			}			
			sort(listJ.begin(), listJ.end());
			for (auto it : listJ) {
				if ((currentShiftedJ < (it + fDeltaDot)) && (currentShiftedJ > (it - fDeltaDot))) {
						currentShiftedJ = it + fDeltaDot;
					} else {
						break;
					}
			}
			if (abs(currentShiftedJ - currentJ)> 0.001) {
				std::cout << "for (" << first << "," << second << ") shifted to " << currentShiftedJ << " for " <<  currentJ << " Hz" << std::endl;
			} else{
				std::cout << "for (" << first << "," << second << ") NOT to " << currentShiftedJ << " for " <<  currentJ << " Hz" << std::endl;
			}
		} //else{
			//	std::cout << "NO J for (" << first << "," << second << ") NO J " << std::endl;
			//}
	}
}

}

void JGraph::setAssignedCoupling(int index1, int index2, double valueJ) {
	ColumnMember columnMember;
	columnMember.Jvalues = valueJ;
	columnMember.shiftedJvalues = valueJ;
	columnMember.hasPartnerIndex = true;
	columnMember.partnerIndex = index2;
	fColumns[index1].columnMembers.push_back(columnMember);
}

void JGraph::Column::sortJ() {
	std::sort(this->columnMembers.begin(), this->columnMembers.end(),
		[](const ColumnMember& lhs, const ColumnMember& rhs) {
      		return lhs.Jvalues < rhs.Jvalues;
	  	}
	);	
};

bool JGraph::addAssignedCoupling(string label1, string label2, double valueJ) {
	if (label1 == label2) return false;
	bool found1 = false;
	size_t index1 = 0;
	for (size_t i = 0; i < getSize(); i++) {
		if(label1 == fColumns[i].label) {index1 = i; found1 = true;}
	}
	if (!found1) return false;
	bool found2 = false;
	size_t index2 = 0;
	for (size_t i = 0; i < getSize(); i++) {
		if(label2 == fColumns[i].label) {index2 = i; found2 = true;}
	}
	if (!found2) return false;
	setAssignedCoupling(index1, index2, valueJ);
	this->fColumns[index1].sortJ();
	setAssignedCoupling(index2, index1, valueJ);
	this->fColumns[index2].sortJ();
	return true;
};

void JGraph::sortColumnByChemicalShift() {
	std::sort(fColumns.begin(), fColumns.end(),
		[](const Column& lhs, const Column& rhs) {
      		return lhs.chemicalShift < rhs.chemicalShift;
	  	}
	);
}

void JGraph::addColumn(double chemicalShift, const vector < double > &aVectorJvalues, string aString) {
	Column column;
	column.chemicalShift = chemicalShift;
	column.shiftedChemicalShift = chemicalShift;
	column.label = aString;
	for (size_t i = 0; i < aVectorJvalues.size(); i++) {
		ColumnMember columnMember;
		columnMember.Jvalues = aVectorJvalues[i];
		columnMember.shiftedJvalues = aVectorJvalues[i];
		columnMember.partnerIndex = 0;
		columnMember.hasPartnerIndex = false;
		column.columnMembers.push_back(columnMember);
	}
	column.sortJ();
	fColumns.push_back(column);
}
