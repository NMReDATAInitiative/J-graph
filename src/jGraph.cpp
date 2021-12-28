#include "jGraph.h"
#include <algorithm>

JGraph::JGraph() {
}

void JGraph::updateShiftedPositions() {

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
