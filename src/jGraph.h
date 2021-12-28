#ifndef JGRAPH_H 
#define JGRAPH_H

#include <vector>
#include <string>

using namespace std;

class JGraph {
public:
	JGraph();
	struct Column {
		double chemicalShift;
		double shiftedChemicalShift;
		string label;
		vector <double> Jvalues;
		vector <double> shiftedJvalues;
		vector <bool> hasPartnerIndex; // false when has no assigned partner
		vector <size_t> partnerIndex;
	};
	void addColumn(double chemicalShift, const vector < double > &Jvalues, string aString = "no label");
	bool addAssignedCoupling(string label1, string label2, double valueJ);
	void setAssignedCoupling(int index1, int index2, double valueJ);
	void updateShiftedPositions();

	size_t getSize() const {return fColumns.size();};
public:
	vector <Column> fColumns;
};

#endif // JGRAPH_H
