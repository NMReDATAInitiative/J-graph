#include "jGraph.h"

JGraph::JGraph() {
}

void JGraph::updateShiftedPositions() {

}

void JGraph::setAssignedCoupling(int index1, int index2, double valueJ) {
	fColumns[index1].Jvalues.push_back(valueJ);
	fColumns[index1].shiftedJvalues.push_back(valueJ);
	fColumns[index1].hasPartnerIndex.push_back(true);
	fColumns[index1].partnerIndex.push_back(index2);
}

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
	setAssignedCoupling(index2, index1, valueJ);
	return true;
};
void JGraph::addColumn(double chemicalShift, const vector < double > &aVectorJvalues, string aString) {
	Column column;
	column.chemicalShift = chemicalShift;
	column.shiftedChemicalShift = chemicalShift;
	column.label = aString;
	for (size_t i = 0; i < aVectorJvalues.size(); i++) {
		column.Jvalues.push_back(aVectorJvalues[i]);
		column.shiftedJvalues.push_back(aVectorJvalues[i]);
		column.partnerIndex.push_back(0);
		column.hasPartnerIndex.push_back(false);
	}

	fColumns.push_back(column);
	std::sort(fColumns.begin(), fColumns.end(), [](const Column& lhs, const Column& rhs) {
      return lhs.chemicalShift < rhs.chemicalShift;
	  });
}
