#include "jGraph.h"
#include <algorithm>
#include <cmath>
#include <iostream> // remove with std::cout and std::endl

/*
/usr/bin/clang++ -std=c++17 -stdlib=libc++ -fdiagnostics-color=always -g /Users/djeanner/git/J-graph/src/*.cpp -o /Users/djeanner/git/J-graph/build/main.out
build/main.out > html/andro.csv
*/

JGraph::JGraph() {
}

void JGraph::setShiftedJ(size_t first, size_t second, double currentShiftedJ) {
for (size_t index = 0; index < fColumns[first].columnMembers.size(); index++) {
	if (fColumns[first].columnMembers[index].hasPartnerIndex) {
		if (fColumns[first].columnMembers[index].partnerIndex == second) {
			fColumns[first].columnMembers[index].shiftedJvalues = currentShiftedJ;
		}
	}
}
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

void JGraph::updateShiftedPositionsCouplings() {
// Will shift up the lines to avoid crossing dots (at the position of the J's) and the lines (possibly shifted)
const size_t lastColuNumber = fColumns.size() - 1;
for (size_t diffIndex = 1; diffIndex < lastColuNumber ; diffIndex++) {
	const size_t lastColGigenDiffIndex = lastColuNumber - diffIndex;
	for (size_t curCol = 0; curCol <= lastColGigenDiffIndex; curCol ++ ) {
		const size_t first = curCol;
		const size_t second = curCol + diffIndex;
	//	double currentShiftedJlast = 0.0;
		double currentShiftedJ = 0.0;
		double currentJ = 0.0;
		size_t indexOther1 = 0;
		size_t indexOther2 = 0;
		
		if (hasJ(first, second, currentJ, currentShiftedJ)) {
		//	while (abs(currentShiftedJlast - currentShiftedJ) > 0.01) {
		//		currentShiftedJlast = currentShiftedJ	;
		//	}

			vector < pair < double, double > > rangesToAvoid; 

			// list all ranges of dots for which top is above currentJ 
			for (size_t inside = first + 1; inside <= second - 1; inside ++) { // exclude current
				for (auto it : this->fColumns[inside].columnMembers) {
					if (currentJ < (it.Jvalues + fDeltaDotAbove)) {
						rangesToAvoid.push_back(make_pair(it.Jvalues + fDeltaDotAbove, it.Jvalues - fDeltaDotBelow));
								std::cerr << "1)   For (" << first << "," << second << ") incremented because " << inside << " J " << it.Jvalues << " " << currentShiftedJ << " for " <<  currentJ << " Hz" << std::endl;
								std::cerr << "1)                 ZZZ (" << it.Jvalues + fDeltaDotAbove << " " << it.Jvalues - fDeltaDotBelow << ") "<< std::endl;
					}
				}
			}		

			// list all ranges of lines for which top is above currentJ 
			for (size_t inside1 = first + 1; inside1 <= second - 1; inside1 ++) { // includes current
				size_t from = 0;
				if (inside1 > diffIndex) from = inside1 - diffIndex;
				size_t to = lastColuNumber;
				if (inside1 + diffIndex < lastColuNumber) to = inside1 + diffIndex;
				for (size_t inside2 = from; inside2 <= to; inside2 ++) { // includes current
					if (inside1 == inside2) continue;
					//if (inside2 <= first && inside1 <= first) continue;
					//if (inside2 >= second && inside1 >= second) continue;
					//			std::cerr << "2)           test (" << inside1 << "," << inside2 << ") " << std::endl;

					double currentShiftedJ2 = 0.0;
					double currentJ2 = 0.0;
					if (hasJ(inside1, inside2, currentJ2, currentShiftedJ2)) {
						if (currentJ < (currentShiftedJ2 + fDeltaLineAbove)) {
							rangesToAvoid.push_back(make_pair(currentShiftedJ2 + fDeltaLineAbove, currentShiftedJ2 - fDeltaLineBelow));
			std::cerr << "2)=  For (" << first << "," << second << ") incremented because " << inside1 << "&" << inside2 << " " << currentShiftedJ2 << " for " <<  currentJ2 << " Hz" << std::endl;
											std::cerr << "2)                 ZZZ (" << currentShiftedJ2 + fDeltaLineAbove << " " << currentShiftedJ2 - fDeltaLineBelow << ") "<< std::endl;

						}
					}
				}
			}
			sort(rangesToAvoid.begin(), rangesToAvoid.end()); // sort by first element
			for (auto it : rangesToAvoid) {
				if ((currentShiftedJ < (it.first)) && (currentShiftedJ > (it.second))) {
						currentShiftedJ = it.first;
				} 
			}
			if (abs(currentShiftedJ - currentJ)> 0.00001) {
				setShiftedJ(first, second, currentShiftedJ);
				setShiftedJ(second, first, currentShiftedJ);
				std::cerr << "For (" << first << "," << second << ") shifted to " << currentShiftedJ << " for " <<  currentJ << " Hz" << std::endl;
			} else {
				std::cerr << "For (" << first << "," << second << ") Not shifted to " << currentShiftedJ << " (for " <<  currentJ << " Hz)" << std::endl;
			}
			//  "chemShift1,chemShift2,indexColumn1,indexColumn2,Jvalue,JvalueShifted,Label" 

			std::cout 
				<< this->fColumns[first].chemicalShift << ","
				<< this->fColumns[second].chemicalShift << ","
				<< first << "," << second << ","
				<< currentJ << "," <<  currentShiftedJ << ","
				//<< "J_" << first << "_" << second
				<< "notLabel_" << first
				<< std::endl;

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
	if (label1 == label2) 
		return false;
	bool found1 = false;
	size_t index1 = 0;
	for (size_t i = 0; i < getSize(); i++) {
		if(label1 == fColumns[i].label) {index1 = i; found1 = true;}
	}
	if (!found1) 
		return false;
	bool found2 = false;
	size_t index2 = 0;
	for (size_t i = 0; i < getSize(); i++) {
		if(label2 == fColumns[i].label) {index2 = i; found2 = true;}
	}
	if (!found2)
		return false;
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
